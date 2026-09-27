import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { cloudinary } from "@/lib/cloudinary";
import { Asset, AssetPhase } from "@/models/Asset";
import { Project } from "@/models/Project";
import { Types } from "mongoose";
import crypto from "crypto";

const VALID_PHASES: AssetPhase[] = ["before", "after", "progress", "unclassified"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as { id?: string })?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const phase = (formData.get("phase") as AssetPhase) || "unclassified";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
    }

    if (!VALID_PHASES.includes(phase)) {
      return NextResponse.json(
        { error: `Invalid phase. Must be one of: ${VALID_PHASES.join(", ")}` },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify project exists and belongs to user
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      ownerId: new Types.ObjectId(userId),
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied." },
        { status: 404 }
      );
    }

    // Determine resource type
    const mimeType = file.type || "";
    const isVideo = mimeType.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";

    // Convert file to buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary (server-side signed upload)
    // Request AI Content Analysis add-on output (auto-tagging, captioning)
    const uploadResult = await new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType as "image" | "video",
            folder: `evidra/${projectId}`,
            // AI Content Analysis: auto-tagging and captioning
            categorization: "google_tagging",
            auto_tagging: 0.6,
            // Request detailed image analysis
            detection: "captioning",
            // Include EXIF data in response
            image_metadata: true,
            exif: true,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as Record<string, unknown>);
            }
          }
        );
        uploadStream.end(buffer);
      }
    );

    // Extract AI tags from Cloudinary response
    const aiTags: string[] = [];
    if (uploadResult.tags && Array.isArray(uploadResult.tags)) {
      aiTags.push(...(uploadResult.tags as string[]));
    }

    // Extract AI caption from detection/captioning result
    let aiCaption: string | undefined;
    if (
      uploadResult.info &&
      typeof uploadResult.info === "object" &&
      (uploadResult.info as Record<string, unknown>).detection
    ) {
      const detection = (uploadResult.info as Record<string, unknown>)
        .detection as Record<string, unknown>;
      if (
        detection.captioning &&
        typeof detection.captioning === "object" &&
        (detection.captioning as Record<string, unknown>).data
      ) {
        const captionData = (detection.captioning as Record<string, unknown>)
          .data as Record<string, unknown>;
        if (captionData.caption) {
          aiCaption = captionData.caption as string;
        }
      }
    }

    // Extract EXIF geodata
    let geo: { lat: number; lng: number } | undefined;
    if (
      uploadResult.image_metadata &&
      typeof uploadResult.image_metadata === "object"
    ) {
      const metadata = uploadResult.image_metadata as Record<string, string>;
      const gpsLat = metadata.GPSLatitude;
      const gpsLng = metadata.GPSLongitude;
      const gpsLatRef = metadata.GPSLatitudeRef;
      const gpsLngRef = metadata.GPSLongitudeRef;

      if (gpsLat && gpsLng) {
        let lat = parseGPSCoordinate(gpsLat);
        let lng = parseGPSCoordinate(gpsLng);

        if (lat !== null && lng !== null) {
          if (gpsLatRef === "S") lat = -lat;
          if (gpsLngRef === "W") lng = -lng;
          geo = { lat, lng };
        }
      }
    }

    // Compute provenance hash (hash of public_id + version + upload timestamp)
    const publicId = uploadResult.public_id as string;
    const version = String(uploadResult.version);
    const uploadTimestamp = uploadResult.created_at as string;
    const provenanceHash = crypto
      .createHash("sha256")
      .update(`${publicId}:${version}:${uploadTimestamp}`)
      .digest("hex");

    // Determine capturedAt from EXIF DateTimeOriginal or upload time
    let capturedAt: Date | undefined;
    if (
      uploadResult.image_metadata &&
      typeof uploadResult.image_metadata === "object"
    ) {
      const metadata = uploadResult.image_metadata as Record<string, string>;
      if (metadata.DateTimeOriginal) {
        const parsed = new Date(metadata.DateTimeOriginal.replace(/:/g, "-").replace(/-(\d{2})-(\d{2})$/, ":$1:$2"));
        if (!isNaN(parsed.getTime())) {
          capturedAt = parsed;
        }
      }
    }

    // Create Asset document
    const asset = await Asset.create({
      projectId: new Types.ObjectId(projectId),
      cloudinaryPublicId: publicId,
      cloudinaryVersion: version,
      resourceType,
      phase,
      capturedAt: capturedAt || new Date(),
      aiTags,
      aiCaption,
      geo,
      provenanceHash,
      uploadedBy: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        asset: {
          _id: asset._id,
          cloudinaryPublicId: asset.cloudinaryPublicId,
          cloudinaryVersion: asset.cloudinaryVersion,
          resourceType: asset.resourceType,
          phase: asset.phase,
          aiTags: asset.aiTags,
          aiCaption: asset.aiCaption,
          geo: asset.geo,
          provenanceHash: asset.provenanceHash,
          capturedAt: asset.capturedAt,
          createdAt: asset.createdAt,
          // Include Cloudinary URL for display
          url: uploadResult.secure_url as string,
          thumbnailUrl: resourceType === "image"
            ? cloudinary.url(publicId, {
                width: 400,
                height: 400,
                crop: "fill",
                quality: "auto",
                format: "auto",
              })
            : (uploadResult.secure_url as string),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Parse GPS coordinate string like "40/1, 26/1, 46/1"
 * or decimal string to a number.
 */
function parseGPSCoordinate(value: string): number | null {
  try {
    // Check if it's already a decimal number
    const num = parseFloat(value);
    if (!isNaN(num) && !value.includes("/")) {
      return num;
    }

    // Parse DMS format: "degrees/1, minutes/1, seconds/1"
    const parts = value.split(",").map((p) => p.trim());
    if (parts.length === 3) {
      const degrees = evalFraction(parts[0]);
      const minutes = evalFraction(parts[1]);
      const seconds = evalFraction(parts[2]);

      if (degrees !== null && minutes !== null && seconds !== null) {
        return degrees + minutes / 60 + seconds / 3600;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function evalFraction(frac: string): number | null {
  const parts = frac.split("/");
  if (parts.length === 2) {
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return num / den;
    }
  }
  const val = parseFloat(frac);
  return isNaN(val) ? null : val;
}

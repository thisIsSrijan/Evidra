import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { Project } from "@/models/Project";
import { Types } from "mongoose";
import { cloudinary } from "@/lib/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as { id?: string })?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const projectId = params.id;

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
    }

    await connectToDatabase();

    // Verify project belongs to user
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

    // Fetch assets, most recent first
    const assets = await Asset.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ createdAt: -1 });

    // Build response with Cloudinary URLs
    const assetsWithUrls = assets.map((asset) => {
      const baseUrl = cloudinary.url(asset.cloudinaryPublicId, {
        secure: true,
        resource_type: asset.resourceType,
      });

      const thumbnailUrl =
        asset.resourceType === "image"
          ? cloudinary.url(asset.cloudinaryPublicId, {
              width: 400,
              height: 400,
              crop: "fill",
              quality: "auto",
              format: "auto",
            })
          : baseUrl;

      return {
        _id: asset._id,
        cloudinaryPublicId: asset.cloudinaryPublicId,
        cloudinaryVersion: asset.cloudinaryVersion,
        resourceType: asset.resourceType,
        phase: asset.phase,
        capturedAt: asset.capturedAt,
        aiTags: asset.aiTags,
        aiCaption: asset.aiCaption,
        geo: asset.geo,
        provenanceHash: asset.provenanceHash,
        createdAt: asset.createdAt,
        url: baseUrl,
        thumbnailUrl,
      };
    });

    return NextResponse.json(
      {
        project: {
          _id: project._id,
          name: project.name,
          description: project.description,
          location: project.location,
        },
        assets: assetsWithUrls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/projects/[id]/assets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets." },
      { status: 500 }
    );
  }
}

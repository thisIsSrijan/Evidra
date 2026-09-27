import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { Project, IProject } from "@/models/Project";
import { User, IUser } from "@/models/User";
import { Types } from "mongoose";
import { cloudinary } from "@/lib/cloudinary";
import { verifyAssetProvenance } from "@/lib/provenance";

export async function GET(
  req: Request,
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params;

    if (!Types.ObjectId.isValid(assetId)) {
      return NextResponse.json(
        { error: "Invalid asset ID format." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    // Ensure models are registered for population
    const _models = [Project, User];
    void _models;

    const asset = await Asset.findById(assetId)
      .populate<{ projectId: IProject }>("projectId")
      .populate<{ uploadedBy: IUser }>("uploadedBy");

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found in verification registry." },
        { status: 404 }
      );
    }

    // Generate signed Cloudinary URL at original, unaltered quality
    const signedUrl = cloudinary.url(asset.cloudinaryPublicId, {
      sign_url: true,
      secure: true,
      type: "upload",
      resource_type: asset.resourceType || "image",
      version: asset.cloudinaryVersion,
    });

    // Run cryptographic re-verification against stored provenance hash
    const verification = verifyAssetProvenance({
      cloudinaryPublicId: asset.cloudinaryPublicId,
      cloudinaryVersion: asset.cloudinaryVersion,
      createdAt: asset.createdAt,
      provenanceHash: asset.provenanceHash,
    });

    // Extract organization name only (protect individual identity)
    const orgName =
      asset.uploadedBy?.orgName ||
      "Verified Conservation Organization";

    return NextResponse.json({
      success: true,
      asset: {
        _id: asset._id.toString(),
        cloudinaryPublicId: asset.cloudinaryPublicId,
        cloudinaryVersion: asset.cloudinaryVersion,
        resourceType: asset.resourceType || "image",
        phase: asset.phase,
        signedOriginalUrl: signedUrl,
        uploadTimestamp: asset.createdAt,
        capturedAt: asset.capturedAt || null,
        uploaderOrg: orgName,
        projectName: asset.projectId?.name || "Field Conservation Project",
        projectLocation: asset.projectId?.location || null,
        geo: asset.geo || null,
        aiCaption: asset.aiCaption || null,
        aiTags: asset.aiTags || [],
        provenanceHash: asset.provenanceHash || null,
        verification,
      },
    });
  } catch (error) {
    console.error("GET /api/verify/[assetId] error:", error);
    return NextResponse.json(
      { error: "Verification service error." },
      { status: 500 }
    );
  }
}

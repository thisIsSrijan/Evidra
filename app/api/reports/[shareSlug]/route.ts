import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Report } from "@/models/Report";
import { Project, IProject } from "@/models/Project";
import { Asset, IAsset } from "@/models/Asset";
import { User } from "@/models/User";
import { cloudinary } from "@/lib/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: { shareSlug: string } }
) {
  try {
    const { shareSlug } = params;

    if (!shareSlug || typeof shareSlug !== "string") {
      return NextResponse.json(
        { error: "Invalid share slug." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Ensure models are registered for population
    const _models = [Project, Asset, User];
    void _models;

    const report = await Report.findOne({ shareSlug })
      .populate<{ projectId: IProject }>("projectId")
      .populate<{ assetIds: IAsset[] }>("assetIds");

    if (!report) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    // Fetch organization name from project owner
    let orgName = "Verified Conservation Organization";
    if (report.projectId?.ownerId) {
      const owner = await User.findById(report.projectId.ownerId);
      if (owner?.orgName) {
        orgName = owner.orgName;
      }
    }

    // Format verified evidence records
    const verifiedAssets = (report.assetIds || []).map((asset: IAsset) => ({
      _id: asset._id.toString(),
      cloudinaryPublicId: asset.cloudinaryPublicId,
      cloudinaryVersion: asset.cloudinaryVersion,
      resourceType: asset.resourceType || "image",
      phase: asset.phase,
      aiCaption: asset.aiCaption,
      aiTags: asset.aiTags || [],
      capturedAt: asset.capturedAt || null,
      createdAt: asset.createdAt,
      provenanceHash: asset.provenanceHash || null,
      verifyUrl: `/verify/${asset._id.toString()}`,
      thumbnailUrl: cloudinary.url(asset.cloudinaryPublicId, {
        width: 400,
        height: 300,
        crop: "fill",
        gravity: "auto",
        fetch_format: "auto",
        quality: "auto",
        secure: true,
      }),
    }));

    return NextResponse.json({
      success: true,
      report: {
        _id: report._id.toString(),
        title: report.title,
        subtitle: report.subtitle,
        narrative: report.narrative,
        coverUrl: report.coverUrl,
        shareSlug: report.shareSlug,
        createdAt: report.createdAt,
        uploaderOrg: orgName,
        project: report.projectId
          ? {
              _id: report.projectId._id.toString(),
              name: report.projectId.name,
              location: report.projectId.location,
            }
          : null,
        evidenceRecords: verifiedAssets,
      },
    });
  } catch (error) {
    console.error("GET /api/reports/[shareSlug] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve impact report." },
      { status: 500 }
    );
  }
}

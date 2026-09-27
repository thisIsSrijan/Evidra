import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Asset, IAsset } from "@/models/Asset";
import { Project } from "@/models/Project";
import { Pairing, PairingStatus } from "@/models/Pairing";
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

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

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

    const query: Record<string, unknown> = {
      projectId: new Types.ObjectId(projectId),
    };

    if (
      statusFilter &&
      ["suggested", "confirmed", "rejected"].includes(statusFilter)
    ) {
      query.status = statusFilter;
    }

    const pairings = await Pairing.find(query)
      .sort({ createdAt: -1 })
      .populate("beforeAssetId")
      .populate("afterAssetId");

    const formattedPairings = pairings.map((p) => {
      const before = p.beforeAssetId as unknown as IAsset;
      const after = p.afterAssetId as unknown as IAsset;

      return {
        _id: p._id.toString(),
        projectId: p.projectId.toString(),
        confidence: p.confidence,
        reasoning: p.reasoning,
        status: p.status,
        createdAt: p.createdAt,
        beforeAsset: before
          ? {
              _id: before._id.toString(),
              phase: before.phase,
              aiCaption: before.aiCaption,
              aiTags: before.aiTags,
              capturedAt: before.capturedAt,
              createdAt: before.createdAt,
              geo: before.geo,
              provenanceHash: before.provenanceHash,
              thumbnailUrl: cloudinary.url(before.cloudinaryPublicId, {
                width: 500,
                height: 380,
                crop: "fill",
                gravity: "auto",
                fetch_format: "auto",
                quality: "auto",
                secure: true,
              }),
              sliderUrl: cloudinary.url(before.cloudinaryPublicId, {
                width: 1400,
                height: 875,
                crop: "fill",
                gravity: "auto",
                fetch_format: "auto",
                quality: "auto",
                secure: true,
              }),
            }
          : null,
        afterAsset: after
          ? {
              _id: after._id.toString(),
              phase: after.phase,
              aiCaption: after.aiCaption,
              aiTags: after.aiTags,
              capturedAt: after.capturedAt,
              createdAt: after.createdAt,
              geo: after.geo,
              provenanceHash: after.provenanceHash,
              thumbnailUrl: cloudinary.url(after.cloudinaryPublicId, {
                width: 500,
                height: 380,
                crop: "fill",
                gravity: "auto",
                fetch_format: "auto",
                quality: "auto",
                secure: true,
              }),
              sliderUrl: cloudinary.url(after.cloudinaryPublicId, {
                width: 1400,
                height: 875,
                crop: "fill",
                gravity: "auto",
                fetch_format: "auto",
                quality: "auto",
                secure: true,
              }),
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      pairings: formattedPairings,
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/pairings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pairings." },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await req.json();
    const { beforeAssetId, afterAssetId, reasoning, confidence, status } = body;

    if (!beforeAssetId || !afterAssetId) {
      return NextResponse.json(
        { error: "both beforeAssetId and afterAssetId are required." },
        { status: 400 }
      );
    }

    if (beforeAssetId === afterAssetId) {
      return NextResponse.json(
        { error: "beforeAssetId and afterAssetId must be distinct assets." },
        { status: 400 }
      );
    }

    await connectToDatabase();

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

    const [beforeAsset, afterAsset] = await Promise.all([
      Asset.findOne({
        _id: new Types.ObjectId(beforeAssetId),
        projectId: new Types.ObjectId(projectId),
      }),
      Asset.findOne({
        _id: new Types.ObjectId(afterAssetId),
        projectId: new Types.ObjectId(projectId),
      }),
    ]);

    if (!beforeAsset || !afterAsset) {
      return NextResponse.json(
        { error: "One or both assets not found in this project." },
        { status: 404 }
      );
    }

    const pairingStatus: PairingStatus = status === "confirmed" ? "confirmed" : "suggested";

    const pairing = await Pairing.create({
      projectId: new Types.ObjectId(projectId),
      beforeAssetId: new Types.ObjectId(beforeAssetId),
      afterAssetId: new Types.ObjectId(afterAssetId),
      confidence: confidence ?? 0.95,
      reasoning: reasoning || "User-verified before & after transformation.",
      status: pairingStatus,
      createdAt: new Date(),
    });

    if (pairingStatus === "confirmed") {
      await Promise.all([
        Asset.updateOne({ _id: beforeAsset._id }, { phase: "before" }),
        Asset.updateOne({ _id: afterAsset._id }, { phase: "after" }),
      ]);
    }

    return NextResponse.json({
      success: true,
      pairing,
    });
  } catch (error) {
    console.error("POST /api/projects/[id]/pairings error:", error);
    return NextResponse.json(
      { error: "Failed to create pairing." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Asset, IAsset } from "@/models/Asset";
import { Project } from "@/models/Project";
import { Pairing, PairingStatus } from "@/models/Pairing";
import { Types } from "mongoose";
import { cloudinary } from "@/lib/cloudinary";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; pairingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as { id?: string })?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { id: projectId, pairingId } = params;

    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(pairingId)) {
      return NextResponse.json({ error: "Invalid ID parameter." }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!["suggested", "confirmed", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be suggested, confirmed, or rejected." },
        { status: 400 }
      );
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

    const pairing = await Pairing.findOne({
      _id: new Types.ObjectId(pairingId),
      projectId: new Types.ObjectId(projectId),
    });

    if (!pairing) {
      return NextResponse.json(
        { error: "Pairing not found." },
        { status: 404 }
      );
    }

    pairing.status = status as PairingStatus;
    await pairing.save();

    // If confirmed, update both Assets' phase fields
    if (status === "confirmed") {
      await Promise.all([
        Asset.updateOne(
          { _id: pairing.beforeAssetId },
          { $set: { phase: "before" } }
        ),
        Asset.updateOne(
          { _id: pairing.afterAssetId },
          { $set: { phase: "after" } }
        ),
      ]);
    }

    // Populate assets for return
    const populated = await Pairing.findById(pairing._id)
      .populate("beforeAssetId")
      .populate("afterAssetId");

    const before = populated?.beforeAssetId as unknown as IAsset;
    const after = populated?.afterAssetId as unknown as IAsset;

    return NextResponse.json({
      success: true,
      pairing: {
        _id: pairing._id.toString(),
        projectId: pairing.projectId.toString(),
        confidence: pairing.confidence,
        reasoning: pairing.reasoning,
        status: pairing.status,
        createdAt: pairing.createdAt,
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
      },
    });
  } catch (error) {
    console.error("PATCH /api/projects/[id]/pairings/[pairingId] error:", error);
    return NextResponse.json(
      { error: "Failed to update pairing status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; pairingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as { id?: string })?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { id: projectId, pairingId } = params;

    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(pairingId)) {
      return NextResponse.json({ error: "Invalid ID parameter." }, { status: 400 });
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

    await Pairing.deleteOne({
      _id: new Types.ObjectId(pairingId),
      projectId: new Types.ObjectId(projectId),
    });

    return NextResponse.json({ success: true, message: "Pairing deleted." });
  } catch (error) {
    console.error("DELETE /api/projects/[id]/pairings/[pairingId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete pairing." },
      { status: 500 }
    );
  }
}

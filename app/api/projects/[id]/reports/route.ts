import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Report } from "@/models/Report";
import { Project } from "@/models/Project";
import { Types } from "mongoose";
import crypto from "crypto";

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
    const { title, subtitle, narrative, assetIds, coverUrl } = body;

    if (!title || !narrative) {
      return NextResponse.json(
        { error: "Title and narrative are required." },
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

    // Generate unique, clean share slug
    const cleanTitleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32);
    const randomSuffix = crypto.randomBytes(3).toString("hex");
    const shareSlug = `${cleanTitleSlug || "impact-story"}-${randomSuffix}`;

    const parsedAssetIds = (Array.isArray(assetIds) ? assetIds : [])
      .filter((id: string) => Types.ObjectId.isValid(id))
      .map((id: string) => new Types.ObjectId(id));

    const report = await Report.create({
      projectId: new Types.ObjectId(projectId),
      title: title.trim(),
      subtitle: subtitle?.trim(),
      narrative: narrative.trim(),
      assetIds: parsedAssetIds,
      coverAssetId: parsedAssetIds[0] || undefined,
      coverUrl: coverUrl || undefined,
      shareSlug,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      report,
      shareSlug,
      shareUrl: `/reports/${shareSlug}`,
    });
  } catch (error) {
    console.error("POST /api/projects/[id]/reports error:", error);
    return NextResponse.json(
      { error: "Failed to publish report." },
      { status: 500 }
    );
  }
}

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

    const reports = await Report.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports." },
      { status: 500 }
    );
  }
}

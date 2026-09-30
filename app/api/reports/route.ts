import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Report } from "@/models/Report";
import { Project, IProject } from "@/models/Project";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as { id?: string })?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    await connectToDatabase();

    // Ensure Project model registered
    const _p = Project;
    void _p;

    // Find all projects owned by this user
    const userProjects = await Project.find({
      ownerId: new Types.ObjectId(userId),
    });
    const projectIds = userProjects.map((p) => p._id);
    const projectIdStrings = userProjects.map((p) => p._id.toString());
    const projectIdsQuery = [...projectIds, ...projectIdStrings];
    const projectMap = new Map(userProjects.map((p) => [p._id.toString(), p]));

    const reports = await Report.find({
      projectId: { $in: projectIdsQuery },
    })
      .sort({ createdAt: -1 })
      .populate<{ projectId: IProject }>("projectId");

    return NextResponse.json({
      success: true,
      reports: reports.map((r) => {
        const projIdStr = r.projectId?._id ? r.projectId._id.toString() : r.projectId?.toString();
        const matchedProj = (r.projectId && (r.projectId as IProject).name) ? (r.projectId as IProject) : projectMap.get(projIdStr);
        return {
          _id: r._id.toString(),
          title: r.title,
          subtitle: r.subtitle,
          narrative: r.narrative,
          coverUrl: r.coverUrl,
          shareSlug: r.shareSlug,
          createdAt: r.createdAt,
          projectName: matchedProj?.name || "Project",
          projectLocation: matchedProj?.location || null,
          assetCount: r.assetIds?.length || 0,
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports." },
      { status: 500 }
    );
  }
}

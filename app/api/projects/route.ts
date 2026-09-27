import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/Project";
import { seedProjectsForUser } from "@/lib/seed";
import { Types } from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as { id?: string })?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    await connectToDatabase();

    let projects = await Project.find({ ownerId: new Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });

    // Auto-seed sample projects if user has none
    if (projects.length === 0) {
      projects = await seedProjectsForUser(userId);
    }

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as { id?: string })?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { name, description, location } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Project name is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newProject = await Project.create({
      name: name.trim(),
      description: description?.trim() || "",
      location: {
        label: location?.label?.trim() || "Unspecified Location",
        lat: Number(location?.lat) || 0,
        lng: Number(location?.lng) || 0,
      },
      ownerId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, project: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { Project } from "@/models/Project";
import { Types } from "mongoose";
import { getGeminiModel } from "@/lib/gemini";

/**
 * POST /api/projects/[id]/search
 * Gemini-powered natural-language search against a project's assets.
 * Translates user query into structured filters and returns matched assets
 * with "why this matched" explanations.
 */
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
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Search query is required." },
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

    // Fetch all assets for this project to build context
    const allAssets = await Asset.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ createdAt: -1 });

    if (allAssets.length === 0) {
      return NextResponse.json({
        results: [],
        interpretation: "No assets in this project to search.",
        structuredFilter: {},
      });
    }

    // Build asset summary for Gemini
    const assetSummaries = allAssets.map((a, i) => ({
      index: i,
      id: a._id.toString(),
      phase: a.phase,
      tags: a.aiTags,
      caption: a.aiCaption || "",
      capturedAt: a.capturedAt?.toISOString() || "",
      hasGeo: !!a.geo,
      geoLat: a.geo?.lat,
      geoLng: a.geo?.lng,
      resourceType: a.resourceType,
    }));

    // Ask Gemini to interpret the natural-language query
    const model = getGeminiModel("gemini-2.0-flash");

    const systemPrompt = `You are a search engine for a conservation project's field media assets. 
Given a natural-language query from a user and a list of assets with their metadata, 
you must:

1. Interpret the query into structured filters (tags, date range, phase, keywords, location proximity).
2. Return the indices of matching assets from the provided list.
3. For each match, provide a brief "reason" explaining why it matched (1 sentence max).

Respond ONLY with valid JSON in this exact format:
{
  "interpretation": "Brief summary of what the user is looking for",
  "structuredFilter": {
    "tags": ["tag1", "tag2"],
    "phase": "before|after|progress|unclassified|any",
    "dateRange": { "from": "ISO date or null", "to": "ISO date or null" },
    "keywords": ["keyword1"],
    "locationHint": "description or null"
  },
  "matches": [
    { "index": 0, "reason": "Why this asset matched" }
  ]
}

Be generous with matching — use semantic similarity (e.g., "river" matches "water", "stream", "creek").
If no assets match at all, return an empty matches array.
Always return valid JSON, no markdown fences.`;

    const userPrompt = `Query: "${query.trim()}"

Project: "${project.name}"
Total assets: ${allAssets.length}

Assets:
${JSON.stringify(assetSummaries, null, 0)}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
    });

    const responseText = result.response.text().trim();

    // Parse Gemini response — strip markdown fences if present
    let parsed: {
      interpretation?: string;
      structuredFilter?: Record<string, unknown>;
      matches?: { index: number; reason: string }[];
    };

    try {
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: return empty results if parsing fails
      return NextResponse.json({
        results: [],
        interpretation: "Search query understood but no structured results could be generated.",
        structuredFilter: {},
        rawResponse: responseText,
      });
    }

    // Build matched asset results with Cloudinary URLs
    const matchedAssets = (parsed.matches || [])
      .filter((m) => m.index >= 0 && m.index < allAssets.length)
      .map((m) => {
        const asset = allAssets[m.index];
        return {
          _id: asset._id.toString(),
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
          matchReason: m.reason,
          // Construct Cloudinary URLs
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${asset.resourceType}/upload/v${asset.cloudinaryVersion}/${asset.cloudinaryPublicId}`,
          thumbnailUrl:
            asset.resourceType === "image"
              ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v${asset.cloudinaryVersion}/${asset.cloudinaryPublicId}`
              : `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${asset.resourceType}/upload/v${asset.cloudinaryVersion}/${asset.cloudinaryPublicId}`,
        };
      });

    return NextResponse.json({
      results: matchedAssets,
      interpretation: parsed.interpretation || "",
      structuredFilter: parsed.structuredFilter || {},
    });
  } catch (error) {
    console.error("POST /api/projects/[id]/search error:", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

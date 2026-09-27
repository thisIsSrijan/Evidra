import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { AssetCluster } from "@/models/AssetCluster";
import { Project } from "@/models/Project";
import { Types } from "mongoose";

/**
 * POST /api/projects/[id]/cluster
 *
 * Background clustering job: groups a project's assets by
 * location proximity + capture-date proximity + shared AI tags.
 * Stores groupings so Step 6 can use them to suggest before/after pairs.
 */

// Haversine distance in km
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Jaccard similarity for tag sets
function tagSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a.map((t) => t.toLowerCase()));
  const setB = new Set(b.map((t) => t.toLowerCase()));
  let intersection = 0;
  setA.forEach((t) => {
    if (setB.has(t)) intersection++;
  });
  const union = new Set([...Array.from(setA), ...Array.from(setB)]).size;
  return union === 0 ? 0 : intersection / union;
}

// Simple DBSCAN-inspired clustering using a combined distance metric
interface AssetNode {
  id: string;
  lat: number | null;
  lng: number | null;
  capturedAt: Date | null;
  tags: string[];
  clusterId: number;
}

function clusterAssets(
  nodes: AssetNode[],
  geoThresholdKm: number = 2,
  timeThresholdDays: number = 30,
  tagThreshold: number = 0.15
): number[] {
  const n = nodes.length;
  const assignments = new Array(n).fill(-1);
  let currentCluster = 0;

  for (let i = 0; i < n; i++) {
    if (assignments[i] !== -1) continue;
    assignments[i] = currentCluster;

    // Expand cluster
    const queue = [i];
    while (queue.length > 0) {
      const idx = queue.shift()!;
      for (let j = 0; j < n; j++) {
        if (assignments[j] !== -1) continue;

        // Compute combined proximity
        let geoClose = false;
        let timeClose = false;
        let tagsClose = false;

        // Geo proximity
        if (
          nodes[idx].lat !== null &&
          nodes[idx].lng !== null &&
          nodes[j].lat !== null &&
          nodes[j].lng !== null
        ) {
          const dist = haversine(
            nodes[idx].lat!,
            nodes[idx].lng!,
            nodes[j].lat!,
            nodes[j].lng!
          );
          geoClose = dist <= geoThresholdKm;
        } else {
          // No geo data — treat as "possibly close"
          geoClose = true;
        }

        // Temporal proximity
        if (nodes[idx].capturedAt && nodes[j].capturedAt) {
          const diffMs = Math.abs(
            nodes[idx].capturedAt!.getTime() - nodes[j].capturedAt!.getTime()
          );
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          timeClose = diffDays <= timeThresholdDays;
        } else {
          timeClose = true;
        }

        // Tag similarity
        const sim = tagSimilarity(nodes[idx].tags, nodes[j].tags);
        tagsClose = sim >= tagThreshold;

        // Need at least 2 of 3 criteria to cluster together
        const score = [geoClose, timeClose, tagsClose].filter(Boolean).length;
        if (score >= 2) {
          assignments[j] = currentCluster;
          queue.push(j);
        }
      }
    }

    currentCluster++;
  }

  return assignments;
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
      return NextResponse.json(
        { error: "Invalid project ID." },
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

    const assets = await Asset.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ capturedAt: 1, createdAt: 1 });

    if (assets.length < 2) {
      return NextResponse.json({
        success: true,
        message: "Not enough assets to cluster (need at least 2).",
        clusters: [],
      });
    }

    // Prepare nodes
    const nodes: AssetNode[] = assets.map((a) => ({
      id: a._id.toString(),
      lat: a.geo?.lat ?? null,
      lng: a.geo?.lng ?? null,
      capturedAt: a.capturedAt || null,
      tags: a.aiTags || [],
      clusterId: -1,
    }));

    // Run clustering
    const assignments = clusterAssets(nodes);

    // Delete old clusters for this project
    await AssetCluster.deleteMany({
      projectId: new Types.ObjectId(projectId),
    });

    // Group by cluster ID
    const clusterMap = new Map<number, typeof nodes>();
    for (let i = 0; i < nodes.length; i++) {
      const cid = assignments[i];
      if (!clusterMap.has(cid)) clusterMap.set(cid, []);
      clusterMap.get(cid)!.push({ ...nodes[i], clusterId: cid });
    }

    // Create cluster documents
    const clusterDocs = [];
    let clusterIndex = 0;
    for (const [, members] of clusterMap) {
      if (members.length < 2) continue; // Only meaningful clusters

      const assetIds = members.map((m) => new Types.ObjectId(m.id));

      // Compute centroid geo
      const geoMembers = members.filter(
        (m) => m.lat !== null && m.lng !== null
      );
      let centroidGeo: { lat: number; lng: number } | undefined;
      if (geoMembers.length > 0) {
        centroidGeo = {
          lat:
            geoMembers.reduce((s, m) => s + m.lat!, 0) / geoMembers.length,
          lng:
            geoMembers.reduce((s, m) => s + m.lng!, 0) / geoMembers.length,
        };
      }

      // Compute centroid date
      const dateMembers = members.filter((m) => m.capturedAt !== null);
      let centroidDate: Date | undefined;
      if (dateMembers.length > 0) {
        const avgMs =
          dateMembers.reduce((s, m) => s + m.capturedAt!.getTime(), 0) /
          dateMembers.length;
        centroidDate = new Date(avgMs);
      }

      // Find shared tags (appear in >50% of members)
      const tagCounts = new Map<string, number>();
      for (const m of members) {
        const seen = new Set<string>();
        for (const t of m.tags) {
          const lower = t.toLowerCase();
          if (!seen.has(lower)) {
            tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
            seen.add(lower);
          }
        }
      }
      const threshold = members.length * 0.5;
      const sharedTags = Array.from(tagCounts.entries())
        .filter(([, count]) => count >= threshold)
        .map(([tag]) => tag);

      const doc = await AssetCluster.create({
        projectId: new Types.ObjectId(projectId),
        label: `Cluster ${clusterIndex + 1}${
          sharedTags.length > 0
            ? ` — ${sharedTags.slice(0, 3).join(", ")}`
            : ""
        }`,
        assetIds,
        centroidGeo,
        centroidDate,
        sharedTags,
        clusterMethod: "geo-temporal-tag",
        createdAt: new Date(),
      });

      clusterDocs.push({
        _id: doc._id,
        label: doc.label,
        assetCount: assetIds.length,
        sharedTags: doc.sharedTags,
        centroidGeo: doc.centroidGeo,
        centroidDate: doc.centroidDate,
      });

      clusterIndex++;
    }

    return NextResponse.json({
      success: true,
      message: `Clustered ${assets.length} assets into ${clusterDocs.length} groups.`,
      clusters: clusterDocs,
    });
  } catch (error) {
    console.error("POST /api/projects/[id]/cluster error:", error);
    return NextResponse.json(
      { error: "Clustering failed." },
      { status: 500 }
    );
  }
}

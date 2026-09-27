import { Types } from "mongoose";
import { Project } from "@/models/Project";

export const SAMPLE_PROJECTS = [
  {
    name: "Tsavo Watershed Basin #04",
    description:
      "Arid riverine ecosystem recovery, erosion gully mitigation, and community-led native acacia and fig tree replanting.",
    location: {
      lat: -3.3167,
      lng: 38.5833,
      label: "Tsavo Conservation Area, Taita-Taveta, Kenya",
    },
  },
  {
    name: "Sundarbans Coastal Mangrove Belt",
    description:
      "Tidal mudflat stabilization, cyclone buffer restoration, and community mangrove nursery planting across saline flood zones.",
    location: {
      lat: 21.9497,
      lng: 88.9007,
      label: "Sundarbans Biosphere Reserve, West Bengal",
    },
  },
  {
    name: "Cerrado Biome Savannah Regeneration",
    description:
      "Biodiversity corridor re-establishment, native grass seed broadcast, and groundwater recharge monitoring across degraded pastures.",
    location: {
      lat: -14.7083,
      lng: -47.5583,
      label: "Chapada dos Veadeiros, Goiás, Brazil",
    },
  },
];

export async function seedProjectsForUser(userId: string | Types.ObjectId) {
  const existingCount = await Project.countDocuments({ ownerId: userId });
  if (existingCount > 0) {
    return await Project.find({ ownerId: userId }).sort({ createdAt: -1 });
  }

  const projectsToCreate = SAMPLE_PROJECTS.map((p) => ({
    ...p,
    ownerId: new Types.ObjectId(userId.toString()),
    createdAt: new Date(),
  }));

  const created = await Project.insertMany(projectsToCreate);
  return created;
}

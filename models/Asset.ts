import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AssetResourceType = "image" | "video";
export type AssetPhase = "before" | "after" | "progress" | "unclassified";

export interface IAssetGeo {
  lat: number;
  lng: number;
}

export interface IAsset extends Document {
  projectId: Types.ObjectId;
  cloudinaryPublicId: string;
  cloudinaryVersion: string;
  resourceType: AssetResourceType;
  phase: AssetPhase;
  capturedAt?: Date;
  aiTags: string[];
  aiCaption?: string;
  semanticEmbeddingText?: string;
  geo?: IAssetGeo;
  provenanceHash?: string;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
      trim: true,
    },
    cloudinaryVersion: {
      type: String,
      required: [true, "Cloudinary version is required"],
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    phase: {
      type: String,
      enum: ["before", "after", "progress", "unclassified"],
      default: "unclassified",
      index: true,
    },
    capturedAt: {
      type: Date,
    },
    aiTags: {
      type: [String],
      default: [],
    },
    aiCaption: {
      type: String,
      trim: true,
    },
    semanticEmbeddingText: {
      type: String,
      trim: true,
    },
    geo: {
      lat: { type: Number },
      lng: { type: Number },
    },
    provenanceHash: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

export const Asset: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);

export default Asset;

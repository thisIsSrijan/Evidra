import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAssetCluster extends Document {
  projectId: Types.ObjectId;
  /** Human-readable label for the cluster */
  label: string;
  /** Asset IDs belonging to this cluster */
  assetIds: Types.ObjectId[];
  /** Centroid geo if available */
  centroidGeo?: { lat: number; lng: number };
  /** Average capture date */
  centroidDate?: Date;
  /** Shared AI tags across cluster members */
  sharedTags: string[];
  /** Clustering metadata */
  clusterMethod: string;
  createdAt: Date;
}

const AssetClusterSchema = new Schema<IAssetCluster>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    assetIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
    centroidGeo: {
      lat: { type: Number },
      lng: { type: Number },
    },
    centroidDate: {
      type: Date,
    },
    sharedTags: {
      type: [String],
      default: [],
    },
    clusterMethod: {
      type: String,
      default: "geo-temporal-tag",
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

export const AssetCluster: Model<IAssetCluster> =
  mongoose.models.AssetCluster ||
  mongoose.model<IAssetCluster>("AssetCluster", AssetClusterSchema);

export default AssetCluster;

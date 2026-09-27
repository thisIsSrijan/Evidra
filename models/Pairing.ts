import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PairingStatus = "suggested" | "confirmed" | "rejected";

export interface IPairing extends Document {
  projectId: Types.ObjectId;
  beforeAssetId: Types.ObjectId;
  afterAssetId: Types.ObjectId;
  confidence?: number;
  status: PairingStatus;
  createdAt: Date;
}

const PairingSchema = new Schema<IPairing>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },
    beforeAssetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "Before asset ID is required"],
      index: true,
    },
    afterAssetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "After asset ID is required"],
      index: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    status: {
      type: String,
      enum: ["suggested", "confirmed", "rejected"],
      default: "suggested",
      index: true,
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

export const Pairing: Model<IPairing> =
  mongoose.models.Pairing || mongoose.model<IPairing>("Pairing", PairingSchema);

export default Pairing;

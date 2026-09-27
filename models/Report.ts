import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReport extends Document {
  projectId: Types.ObjectId;
  title: string;
  narrative: string;
  assetIds: Types.ObjectId[];
  coverAssetId?: Types.ObjectId;
  shareSlug?: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Report title is required"],
      trim: true,
    },
    narrative: {
      type: String,
      required: [true, "Narrative is required"],
    },
    assetIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
    coverAssetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
    },
    shareSlug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
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

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;

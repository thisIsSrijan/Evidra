import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProjectLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  location?: IProjectLocation;
  ownerId: Types.ObjectId;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      label: { type: String, trim: true },
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
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

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;

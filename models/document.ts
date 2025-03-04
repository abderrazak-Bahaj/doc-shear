import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      required: true,
    },
    privacy: {
      type: String,
      enum: ["private", "public", "restricted", "one-time"],
      default: "private",
    },
    publicSlug: {
      type: String,
      sparse: true,
    },
    oneTimeKey: {
      type: String,
      sparse: true,
    },
    allowedUsers: [
      {
        email: String,
        role: {
          type: String,
          enum: ["viewer", "editor"],
        },
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Define indexes only once
documentSchema.index({ userId: 1 });
documentSchema.index({ publicSlug: 1 }, { unique: true, sparse: true });
documentSchema.index({ oneTimeKey: 1 }, { unique: true, sparse: true });

// Clear existing models before creating new one
mongoose.models = {};

// Create and export the model
const Document = mongoose.model("Document", documentSchema);

export default Document;
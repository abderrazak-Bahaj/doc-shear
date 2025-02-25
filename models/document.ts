import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      default: "<p>Start writing your document...</p>",
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    privacy: {
      type: String,
      enum: ["private", "public", "restricted", "one-time"],
      default: "private",
      required: true,
    },
    publicSlug: {
      type: String,
      sparse: true,
    },
    oneTimeKey: {
      type: String,
      sparse: true,
    },
    oneTimeViewed: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
    },
    allowedUsers: [
      {
        email: String,
        role: {
          type: String,
          enum: ["viewer", "editor"],
        },
        confirmedAt: Date,
      },
    ],
    pendingInvites: [
      {
        email: String,
        role: {
          type: String,
          enum: ["viewer", "editor"],
        },
        invitedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes
documentSchema.index({ publicSlug: 1 }, { sparse: true });
documentSchema.index({ oneTimeKey: 1 }, { sparse: true });
documentSchema.index({ "allowedUsers.email": 1 });

// Ensure the model is not recreated if it already exists
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;
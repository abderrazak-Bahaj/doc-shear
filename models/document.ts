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
      enum: ["private", "public", "restricted"],
      default: "private",
      required: true,
    },
    publicSlug: {
      type: String,
      sparse: true,
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
documentSchema.index({ "allowedUsers.email": 1 });

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;
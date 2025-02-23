import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    // Find documents where user is owner or has access
    const documents = await Document.find({
      $or: [
        { userId: session.user.email },
        { "allowedUsers.email": session.user.email },
      ],
    }).sort({ updatedAt: -1 });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, content, privacy, publicSlug } = body;

    if (!title?.trim()) {
      return new NextResponse("Title is required", { status: 400 });
    }

    await connectToDatabase();

    console.log("Creating document with:", {
      title,
      privacy,
      publicSlug,
      userId: session.user.email
    });

    const documentData = {
      title: title.trim(),
      content: content || "<p>Start writing your document...</p>",
      userId: session.user.email,
      privacy: privacy || "private",
      publicSlug: privacy === "public" ? publicSlug : undefined,
      viewCount: 0,
      allowedUsers: [],
      pendingInvites: [],
    };

    // Create document with all fields
    const document = await Document.create(documentData);

    // Verify the saved document
    const savedDoc = await Document.findById(document._id);
    console.log("Saved document:", {
      id: savedDoc._id,
      privacy: savedDoc.privacy,
      publicSlug: savedDoc.publicSlug,
      userId: savedDoc.userId
    });

    return NextResponse.json(savedDoc);
  } catch (error: any) {
    console.error("Error creating document:", error);
    if (error.errors?.content) {
      return new NextResponse("Content is required", { status: 400 });
    }
    return new NextResponse(
      error.message || "Internal Server Error",
      { status: error.status || 500 }
    );
  }
}
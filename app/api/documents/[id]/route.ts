import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const document = await Document.findById(params.id);
    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check if document is public
    if (document.privacy === "public") {
      // Update view count and last viewed time for public documents
      document.viewCount = (document.viewCount || 0) + 1;
      document.lastViewedAt = new Date();
      await document.save();
      return NextResponse.json(document);
    }

    // If not public, check user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has access
    const hasAccess = 
      document.userId === session.user.email ||
      document.allowedUsers.some(user => user.email === session.user.email);

    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, content, privacy, publicSlug } = body;

    console.log("Updating document:", {
      id: params.id,
      privacy,
      publicSlug,
    });

    await connectToDatabase();

    const document = await Document.findOne({
      _id: params.id,
      userId: session.user.email, // Only owner can update
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Update document fields
    if (title) document.title = title;
    if (content) document.content = content;
    if (privacy) {
      document.privacy = privacy;
      // Update public slug
      if (privacy === "public") {
        document.publicSlug = publicSlug;
        console.log("Setting document to public with slug:", publicSlug);
      } else {
        document.publicSlug = undefined;
        console.log("Removing public slug");
      }
    }

    const savedDoc = await document.save();
    console.log("Saved document:", {
      id: savedDoc._id,
      privacy: savedDoc.privacy,
      publicSlug: savedDoc.publicSlug,
    });

    return NextResponse.json(savedDoc);
  } catch (error) {
    console.error("Error updating document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    const document = await Document.findOneAndDelete({
      _id: params.id,
      userId: session.user.email, // Only owner can delete
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  console.log("Received request for slug:", params.slug); // Debug log

  try {
    await connectToDatabase();

    // Find document by slug and ensure it's public
    const document = await Document.findOne({
      publicSlug: params.slug,
      privacy: "public",
    });

    console.log("Found document:", {
      id: document?._id,
      privacy: document?.privacy,
      publicSlug: document?.publicSlug,
    }); // Debug log

    if (!document) {
      console.log("Document not found or not public"); // Debug log
      return new NextResponse("Document not found or is no longer public", {
        status: 404,
      });
    }

    // Update view count and last viewed time
    document.viewCount = (document.viewCount || 0) + 1;
    document.lastViewedAt = new Date();
    await document.save();

    // Return the document with all necessary fields
    return NextResponse.json({
      _id: document._id,
      title: document.title,
      content: document.content,
      privacy: document.privacy,
      publicSlug: document.publicSlug,
      viewCount: document.viewCount,
      lastViewedAt: document.lastViewedAt,
    });
  } catch (error) {
    console.error("Error in shared document API:", error); // Debug log
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { key } = await request.json();

    if (!key) {
      return new NextResponse("Access key is required", { status: 400 });
    }

    await connectToDatabase();

    // Find document and ensure it hasn't been viewed
    const document = await Document.findOne({
      publicSlug: params.slug,
      oneTimeKey: key,
      privacy: "one-time",
      oneTimeViewed: false,
    });

    if (!document) {
      return new NextResponse(
        "Document not found or has already been viewed",
        { status: 404 }
      );
    }

    // Mark as viewed
    document.oneTimeViewed = true;
    document.viewCount = (document.viewCount || 0) + 1;
    document.lastViewedAt = new Date();
    await document.save();

    // Return the document
    return NextResponse.json({
      _id: document._id,
      title: document.title,
      content: document.content,
    });
  } catch (error) {
    console.error("Error in one-time document API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

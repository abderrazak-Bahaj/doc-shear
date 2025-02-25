import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new NextResponse("Access key is required", { status: 400 });
    }

    await connectToDatabase();

    // Find the document by public slug and one-time key
    const document = await Document.findOne({
      publicSlug: params.slug,
      oneTimeKey: key,
      privacy: "one-time"
    });

    if (!document) {
      return new NextResponse("Document not found or already viewed", { status: 404 });
    }

    // Document found, prepare response
    const response = {
      _id: document._id,
      title: document.title,
      content: document.content,
      updatedAt: document.updatedAt
    };

    // Delete the document as it's one-time view
    await Document.findByIdAndDelete(document._id);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error accessing one-time document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

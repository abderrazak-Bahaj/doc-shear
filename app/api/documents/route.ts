import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    const documents = await Document.find({
      userId: session.user.email,
    }).sort({ updatedAt: -1 });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error in GET /api/documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content, privacy, publicSlug, oneTimeKey } = await request.json();

    await connectToDatabase();

    const document = await Document.create({
      title,
      content,
      userId: session.user.email,
      privacy: privacy || "private",
      publicSlug,
      oneTimeKey,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error in POST /api/documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
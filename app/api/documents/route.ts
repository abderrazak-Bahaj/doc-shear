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

    await connectToDatabase();
    
    const body = await request.json();
    const { title, content, privacy, publicSlug, oneTimeKey } = body;

    // Validate privacy value
    const validPrivacyValues = ['private', 'public', 'restricted', 'one-time'];
    if (!validPrivacyValues.includes(privacy)) {
      return new NextResponse(
        JSON.stringify({
          error: `Invalid privacy value. Must be one of: ${validPrivacyValues.join(', ')}`
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const documentData = {
      title,
      content,
      userId: session.user.email,
      privacy,
      ...(privacy === 'public' && { publicSlug }),
      ...(privacy === 'one-time' && { oneTimeKey }),
    };

    console.log('Creating document with data:', documentData);

    const document = await Document.create(documentData);

    console.log('Document created successfully:', document);

    return NextResponse.json(document);

  } catch (error) {
    console.error("Error in POST /api/documents:", error);

    if (error instanceof Error) {
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        return new NextResponse(
          JSON.stringify({
            error: 'Validation Error',
            details: error.message
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Handle duplicate key errors
      if (error.name === 'MongoError' && (error as any).code === 11000) {
        return new NextResponse(
          JSON.stringify({
            error: 'Duplicate Error',
            details: 'A document with this key already exists'
          }),
          { 
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
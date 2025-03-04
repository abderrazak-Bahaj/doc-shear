import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import Document from '@/models/document';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDatabase();

    // Convert string ID to ObjectId
    let documentId;
    try {
      documentId = new mongoose.Types.ObjectId(params.id);
    } catch (error) {
      return new NextResponse('Invalid document ID', { status: 400 });
    }

    const document = await Document.findOne({
      _id: documentId,
      $or: [
        { userId: session.user.email }, // Document owner
        { 'allowedUsers.email': session.user.email }, // Shared with user
        { privacy: 'public' }, // Public document
      ],
    }).lean();

    // Check if document exists and user has access
    if (!document) {
      return new NextResponse('Not Found or Not Authorized', { status: 403 });
    }

    // Return the document
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDatabase();

    // Convert string ID to ObjectId
    let documentId;
    try {
      documentId = new mongoose.Types.ObjectId(params.id);
    } catch (error) {
      return new NextResponse('Invalid document ID', { status: 400 });
    }

    const body = await request.json();
    const { title, content, privacy, publicSlug } = body;

    const document = await Document.findOne({
      _id: documentId,
      userId: session.user.email, // Only owner can update
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Update document fields
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (privacy !== undefined) {
      document.privacy = privacy;
      // Update public slug
      if (privacy === 'public') {
        document.publicSlug = publicSlug;
      } else {
        document.publicSlug = undefined;
      }
    }

    const savedDoc = await document.save();
    return NextResponse.json(savedDoc);
  } catch (error) {
    console.error('Error updating document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDatabase();

    // Convert string ID to ObjectId
    let documentId;
    try {
      documentId = new mongoose.Types.ObjectId(params.id);
    } catch (error) {
      return new NextResponse('Invalid document ID', { status: 400 });
    }

    const document = await Document.findOneAndDelete({
      _id: documentId,
      userId: session.user.email, // Only owner can delete
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

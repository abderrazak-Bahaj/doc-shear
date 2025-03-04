import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import Document from '@/models/document';
import { authOptions } from '../../auth/[...nextauth]/route';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { documentId, email, role } = await request.json();

    if (!documentId || !email || !role) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    await connectToDatabase();

    const document = await Document.findOne({
      _id: documentId,
      userId: session.user.email,
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Check if user is already invited
    const existingInvite = document.pendingInvites.find(invite => invite.email === email);
    if (existingInvite) {
      return new NextResponse('User already invited', { status: 400 });
    }

    // Check if user already has access
    const existingAccess = document.allowedUsers.find(user => user.email === email);
    if (existingAccess) {
      return new NextResponse('User already has access', { status: 400 });
    }

    // Add to pending invites
    document.pendingInvites.push({
      email,
      role,
      invitedAt: new Date(),
    });

    await document.save();

    // Send invitation email
    const inviteUrl = `${process.env.NEXTAUTH_URL}/documents/invite/${documentId}`;
    await sendEmail({
      to: email,
      subject: `${session.user.name} shared a document with you`,
      text: `You've been invited to collaborate on "${document.title}". Click here to accept: ${inviteUrl}`,
    });

    return NextResponse.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sharing document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { documentId, accept } = await request.json();

    if (!documentId) {
      return new NextResponse('Document ID is required', { status: 400 });
    }

    await connectToDatabase();

    const document = await Document.findById(documentId);

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Find the pending invite
    const inviteIndex = document.pendingInvites.findIndex(
      invite => invite.email === session.user.email
    );

    if (inviteIndex === -1) {
      return new NextResponse('No pending invite found', { status: 404 });
    }

    const invite = document.pendingInvites[inviteIndex];

    if (accept) {
      // Add to allowed users
      document.allowedUsers.push({
        email: session.user.email,
        role: invite.role,
        confirmedAt: new Date(),
      });
    }

    // Remove from pending invites
    document.pendingInvites.splice(inviteIndex, 1);

    await document.save();

    return NextResponse.json({
      message: accept ? 'Invite accepted' : 'Invite declined',
    });
  } catch (error) {
    console.error('Error handling invite:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

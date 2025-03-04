import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hash } from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/user';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await request.json();

    if (!name || !email) {
      return new NextResponse('Name and email are required', { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Update basic info
    user.name = name;
    user.email = email;

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password if the user has one
      if (user.password) {
        const isValid = await compare(currentPassword, user.password);
        if (!isValid) {
          return new NextResponse('Invalid current password', { status: 400 });
        }
      }
      user.password = await hash(newPassword, 12);
    }

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

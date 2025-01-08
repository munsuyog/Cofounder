// app/api/users/[id]/activate/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Types } from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if GitHub is connected
    if (!user.githubId) {
      return NextResponse.json(
        { error: 'GitHub account must be connected before activation' },
        { status: 400 }
      );
    }

    // Activate user
    user.status = 'ACTIVE';
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('User activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate user' },
      { status: 500 }
    );
  }
}
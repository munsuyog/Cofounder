import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserRole } from '@/types/User';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify role
    if (user.role !== UserRole.FOUNDER) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create response without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      companyName: user.companyName,
      industry: user.industry,
      fundingStage: user.fundingStage,
      teamSize: user.teamSize,
      location: user.location
    };

    return NextResponse.json({
      success: true,
      message: 'Sign in successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Founder signin error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
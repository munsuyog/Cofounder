// app/api/auth/founder/signup/route.ts
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { IFounderSignupData } from '@/types/User';

export async function POST(request: Request) {
  try {
    await connectDB();

    const data: IFounderSignupData = await request.json();
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      companyName,
      industry,
      fundingStage,
      teamSize,
      location 
    } = data;

    // Validation
    if (!email || !password || !firstName || !lastName || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await User.create({
      ...data,
      password: hashedPassword,
      role: 'FOUNDER',
      status: 'ACTIVE'
    });

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
      message: 'Founder account created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Founder signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

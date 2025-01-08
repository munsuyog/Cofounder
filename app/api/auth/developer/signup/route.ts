// app/api/auth/developer/signup/route.ts
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { 
  IDeveloperSignupData, 
  SignupResponse, 
  UserRole, 
  UserStatus, 
  UserWithoutPassword 
} from '@/types/User';

export async function POST(req: Request) {
  try {
    await connectDB();

    const data: IDeveloperSignupData = await req.json();
    const { email, password, firstName, lastName, skills } = data;

    // Validation
    if (!email || !password || !firstName || !lastName || !skills) {
      return NextResponse.json<SignupResponse>({
        success: false,
        message: 'Validation failed',
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json<SignupResponse>({
        success: false,
        message: 'Registration failed',
        error: 'Email already registered'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await User.create({
      ...data,
      password: hashedPassword,
      role: UserRole.DEVELOPER,
      status: UserStatus.PENDING
    });

    // Create response object without password
    const userWithoutPassword: UserWithoutPassword = {
      _id: user.id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      whatsappCountryCode: user.whatsappCountryCode,
      whatsappNumber: user.whatsappNumber,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      skills: user.skills,
      experience: user.experience,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json<SignupResponse>({
      success: true,
      message: 'Developer registered successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Developer signup error:', error);
    return NextResponse.json<SignupResponse>({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Failed to create account'
    }, { status: 500 });
  }
}
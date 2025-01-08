import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getGitHubProfile } from '@/lib/github';
import { SocialConnectRequest, UserResponse } from '@/types/api';
import { IUser } from '@/types/User';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, code }: SocialConnectRequest = await req.json();

    // Exchange code for GitHub profile data
    const githubData = await getGitHubProfile(code);

    // Check if GitHub account is already connected
    const existingUser = await User.findOne({ githubId: githubData.id });
    if (existingUser && existingUser.id.toString() !== userId) {
      return NextResponse.json<UserResponse>(
        {
          message: 'Error',
          error: 'GitHub account already connected to another user'
        },
        { status: 400 }
      );
    }

    // Extract languages from repositories as skills
    const skills = Array.from(new Set(
      githubData.repositories
        .map(repo => repo.language)
        .filter(lang => lang !== 'Unknown')
    ));

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        githubId: githubData.id,
        githubData,
        status: 'ACTIVE',
        $addToSet: { skills: { $each: skills } }
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json<UserResponse>(
        {
          message: 'Error',
          error: 'User not found'
        },
        { status: 404 }
      );
    }

    // Create a new object without password
    const userObject: Omit<IUser, 'password'> = {
      _id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      whatsappCountryCode: user.whatsappCountryCode,
      whatsappNumber: user.whatsappNumber,
      location: user.location,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      githubId: user.githubId,
      githubData: user.githubData,
      linkedinId: user.linkedinId,
      linkedinData: user.linkedinData,
      skills: user.skills,
      experience: user.experience,
      companyName: user.companyName,
      industry: user.industry,
      fundingStage: user.fundingStage,
      teamSize: user.teamSize,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json<UserResponse>({
      message: 'GitHub account connected successfully',
      user: userObject
    });
    
  } catch (error) {
    console.error('GitHub connection error:', error);
    return NextResponse.json<UserResponse>(
      {
        message: 'Error',
        error: 'Failed to connect GitHub account'
      },
      { status: 500 }
    );
  }
}
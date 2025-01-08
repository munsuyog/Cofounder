// app/api/auth/github/callback/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getGitHubProfile } from '@/lib/github';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

async function getRedirectUrl(path: string): Promise<string> {
  const headersList = await headers();
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = headersList.get('host') || 'localhost:3000';
  return `${protocol}://${host}${path}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the userId

    if (!code || !state) {
      const redirectUrl = await getRedirectUrl('/signup/connect?error=Invalid OAuth callback');
      return NextResponse.redirect(redirectUrl);
    }

    await connectDB();

    // Get GitHub profile data
    const githubData = await getGitHubProfile(code);

    // Check if GitHub account is already connected to another user
    const existingUser = await User.findOne({ githubId: githubData.id });
    
    if (existingUser && existingUser.id.toString() !== state) {
      const redirectUrl = await getRedirectUrl('/signup/connect?error=GitHub account already connected to another user');
      return NextResponse.redirect(redirectUrl);
    }

    // Extract skills from repositories
    const skills = Array.from(new Set(
      githubData.repositories
        .map(repo => repo.language)
        .filter(lang => lang !== 'Unknown' && lang != null)
    ));

    // Update user
    const user = await User.findByIdAndUpdate(
      state,
      {
        githubId: githubData.id,
        githubData,
        status: 'ACTIVE',
        $addToSet: { skills: { $each: skills } }
      },
      { new: true }
    );

    if (!user) {
      const redirectUrl = await getRedirectUrl('/auth/developer/signup/connect?error=User not found');
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect back to connect page with success
    const successUrl = await getRedirectUrl('/auth/developer/signup/connect?github=success');
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('GitHub callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect GitHub account';
    const redirectUrl = await getRedirectUrl(`/auth/developer/signup/connect?error=${encodeURIComponent(errorMessage)}`);
    return NextResponse.redirect(redirectUrl);
  }
}
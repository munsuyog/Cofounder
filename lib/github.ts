// lib/github.ts
import { IGithubData } from '@/types/User';

interface GitHubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

export async function getGitHubProfile(code: string): Promise<IGithubData> {
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: `https://cofounder-lake.vercel.app/api/auth/github/callback`
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token Response Status:', tokenResponse.status);
      console.error('Token Response Status Text:', tokenResponse.statusText);
      const errorText = await tokenResponse.text();
      console.error('Token Response Error:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token Data:', { ...tokenData, access_token: '[REDACTED]' });

    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'No access token received');
    }

    // Get user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CoFounder-App'
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user profile: ${userResponse.statusText}`);
    }

    const profile = await userResponse.json();

    // Get repositories
    const reposResponse = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100&type=owner',
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CoFounder-App'
        },
      }
    );

    if (!reposResponse.ok) {
      throw new Error(`Failed to fetch repositories: ${reposResponse.statusText}`);
    }

    const repos = await reposResponse.json();

    // Get contributions (public events)
    const contributionsResponse = await fetch(
      `https://api.github.com/users/${profile.login}/events/public`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CoFounder-App'
        },
      }
    );

    if (!contributionsResponse.ok) {
      throw new Error(`Failed to fetch contributions: ${contributionsResponse.statusText}`);
    }

    const contributions = await contributionsResponse.json();

    return {
      id: profile.id.toString(),
      login: profile.login,
      name: profile.name || profile.login,
      email: profile.email || '',
      avatar_url: profile.avatar_url,
      bio: profile.bio || '',
      public_repos: profile.public_repos,
      followers: profile.followers,
      repositories: repos.map((repo: any) => ({
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || '',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Unknown',
      })),
      contributions: contributions
    };
  } catch (error) {
    console.error('GitHub Profile Error:', error);
    throw error;
  }
}
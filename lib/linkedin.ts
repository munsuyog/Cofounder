// lib/linkedin.ts
import { ILinkedinData } from '@/types/User';

export async function getLinkedInProfile(code: string): Promise<ILinkedinData> {
  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get LinkedIn access token');
    }

    const { access_token } = await tokenResponse.json();

    // Fetch basic profile information
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    const profileData = await profileResponse.json();

    // Fetch email address
    const emailResponse = await fetch(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!emailResponse.ok) {
      throw new Error('Failed to fetch LinkedIn email');
    }

    const emailData = await emailResponse.json();
    const email = emailData.elements[0]['handle~'].emailAddress;

    // Fetch profile picture
    const pictureResponse = await fetch(
      'https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!pictureResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile picture');
    }

    const pictureData = await pictureResponse.json();
    const profilePicture = pictureData.profilePicture?.['displayImage~']?.elements[0]?.identifiers[0]?.identifier;

    // Fetch work experience
    const experienceResponse = await fetch(
      'https://api.linkedin.com/v2/positions?q=members&projection=(elements*(title,companyName,startDate,endDate,company))',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!experienceResponse.ok) {
      throw new Error('Failed to fetch LinkedIn experience');
    }

    const experienceData = await experienceResponse.json();
    const experience = experienceData.elements.map((job: any) => ({
      title: job.title,
      company: job.companyName || job.company?.name || '',
      startDate: `${job.startDate.year}-${job.startDate.month || '01'}`,
      endDate: job.endDate ? `${job.endDate.year}-${job.endDate.month || '01'}` : undefined,
    }));

    // Construct the final LinkedIn data object
    const linkedinData: ILinkedinData = {
      id: profileData.id,
      firstName: profileData.localizedFirstName,
      lastName: profileData.localizedLastName,
      email,
      profilePicture,
      experience,
    };

    return linkedinData;

  } catch (error) {
    console.error('LinkedIn API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch LinkedIn profile');
  }
}

// Error handling utility
export class LinkedInError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'LinkedInError';
  }
}

// Helper function to check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

// Helper function to refresh token
export async function refreshLinkedInToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    throw new LinkedInError(
      'Failed to refresh token',
      'REFRESH_TOKEN_ERROR',
      response.status
    );
  }

  const { access_token } = await response.json();
  return access_token;
}
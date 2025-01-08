// app/(auth)/signup/connect/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Loader2 } from 'lucide-react';

export default function ConnectPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/signup');
    } else {
      setUserId(storedUserId);
      checkConnection(storedUserId);
    }
  }, [router]);

  const checkConnection = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      
      if (data.user) {
        setGithubConnected(!!data.user.githubId);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleGithubConnect = () => {
    if (!userId) return;
      
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    // Make sure this exactly matches what's in your GitHub OAuth App settings
    const redirectUri = encodeURIComponent(`https://cofounder-lake.vercel.app/api/auth/github/callback`);
    const state = userId;
    const scope = 'read:user,repo';
      
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    console.log('GitHub OAuth URL:', githubUrl); // For debugging
    window.location.href = githubUrl;
  };

  const handleContinue = async () => {
    if (!githubConnected) {
      setError('Please connect your GitHub account to continue');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/activate`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to activate account');
      }

      router.push('/dashboard/developer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Connect GitHub Account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Connect your GitHub account to complete your profile and showcase your projects.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleGithubConnect}
          disabled={githubConnected || loading}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            githubConnected 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-800 hover:bg-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
        >
          <Github className="mr-2 h-5 w-5" />
          {githubConnected ? 'GitHub Connected' : 'Connect GitHub'}
        </button>

        {githubConnected && (
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Processing...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {githubConnected ? (
            <>
              <span className="text-green-600">✓</span> GitHub connected
            </>
          ) : (
            'GitHub connection required to continue'
          )}
        </p>
      </div>
    </div>
  );
}
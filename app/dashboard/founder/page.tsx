'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Briefcase } from 'lucide-react';
import CreateGigModal from '@/components/gigs/CreateGigModal';
import GigsList from '@/components/gigs/GigsList';
import ApplicationsList from '@/components/applications/ApplicationsList';

export default function FounderDashboard() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'gigs' | 'applications'>('gigs');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/auth/founder/signin');
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Founder Dashboard</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Gig
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('gigs')}
                className={`
                  ${activeTab === 'gigs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                `}
              >
                <Briefcase className="h-5 w-5 mr-2" />
                My Gigs
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`
                  ${activeTab === 'applications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                `}
              >
                <Users className="h-5 w-5 mr-2" />
                Applications
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'gigs' ? (
          <GigsList founderId={userId} />
        ) : (
          <ApplicationsList founderId={userId} />
        )}
      </div>

      {/* Create Gig Modal */}
      <CreateGigModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        founderId={userId}
      />
    </div>
  );
}
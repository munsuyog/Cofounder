// app/dashboard/developer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';
import AvailableGigs from '@/components/developer/AvailableGigs';
import MyApplications from '@/components/developer/MyApplications';

export default function DeveloperDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'available' | 'applications'>('available');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/auth/developer/signin');
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
            <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
            <div className="flex space-x-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <Clock className="h-4 w-4 mr-1" />
                Active Applications: 5
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                Shortlisted: 2
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('available')}
                className={`
                  ${activeTab === 'available'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                `}
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Available Opportunities
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
                <CheckCircle className="h-5 w-5 mr-2" />
                My Applications
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'available' ? (
          <AvailableGigs userId={userId} />
        ) : (
          <MyApplications userId={userId} />
        )}
      </div>
    </div>
  );
}
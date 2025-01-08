// components/developer/MyApplications.tsx
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PopulatedApplication } from '@/types/application';

interface MyApplicationsProps {
  userId: string;
}

export default function MyApplications({ userId }: MyApplicationsProps) {
  const [applications, setApplications] = useState<PopulatedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/applications/developer/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw application');
      }

      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw application');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
        <p className="mt-1 text-sm text-gray-500">Browse available opportunities and submit your first application.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {applications.map((application) => (
        <div
          key={application._id.toString()}
          className="bg-white shadow overflow-hidden sm:rounded-lg"
        >
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {application.gig.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Applied {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                  application.status === 'SHORTLISTED' 
                    ? 'bg-green-100 text-green-800'
                    : application.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {application.status === 'SHORTLISTED' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {application.status === 'REJECTED' && <XCircle className="h-4 w-4 mr-1" />}
                  {application.status === 'PENDING' && <Clock className="h-4 w-4 mr-1" />}
                  {application.status}
                </span>

                {application.status === 'PENDING' && (
                  <button
                    onClick={() => handleWithdraw(application._id.toString())}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Expected Equity</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.expectedEquity}%</dd>
              </div>

              {application.expectedBudget && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Expected Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.expectedBudget} {application.gig.budget?.currency}
                  </dd>
                </div>
              )}

              {application.status === 'SHORTLISTED' && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-green-500" />
                    Next Steps
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    The founder will contact you shortly via email to schedule a meeting.
                  </dd>
                </div>
              )}
            </dl>

            {application.coverLetter && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500">Your Cover Letter</h4>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {application.coverLetter}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
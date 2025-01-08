// components/developer/AvailableGigs.tsx
'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Users, MapPin, Clock } from 'lucide-react';
import ApplyModal from './ApplyModal';
import { IGigWithId } from '@/types/gigs';

interface AvailableGigsProps {
  userId: string;
}

export default function AvailableGigs({ userId }: AvailableGigsProps) {
  const [gigs, setGigs] = useState<IGigWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGig, setSelectedGig] = useState<IGigWithId | null>(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const response = await fetch('/api/gigs?status=OPEN');
      if (!response.ok) {
        throw new Error('Failed to fetch gigs');
      }
      const data = await response.json();
      setGigs(data.gigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gigs');
    } finally {
      setLoading(false);
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

  if (gigs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No opportunities available</h3>
        <p className="mt-1 text-sm text-gray-500">Check back later for new opportunities.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gigs.map((gig) => (
          <div
            key={gig._id.toString()}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {gig.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-3">
                {gig.description}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {gig.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Equity Range
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {gig.equity.min}% - {gig.equity.max}%
                  </dd>
                </div>

                {gig.budget && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Budget
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {gig.budget.min} - {gig.budget.max} {gig.budget.currency}
                    </dd>
                  </div>
                )}

                {gig.preferredExperience && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Experience
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {gig.preferredExperience}+ years
                    </dd>
                  </div>
                )}

                {gig.location && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {gig.location}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => setSelectedGig(gig)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedGig && (
        <ApplyModal
          gig={selectedGig}
          userId={userId}
          onClose={() => setSelectedGig(null)}
          onSuccess={fetchGigs}
        />
      )}
    </>
  );
}
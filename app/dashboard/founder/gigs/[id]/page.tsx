"use client"
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Edit, 
  X, 
  Users, 
  DollarSign, 
  Clock, 
  MapPin, 
  Archive, 
  ChevronLeft 
} from 'lucide-react';
import Link from 'next/link';
import EditGigModal from '@/components/gigs/EditGigModal';
import ApplicationsList from '@/components/applications/ApplicationsList';
import { IGig, IGigWithId } from '@/types/gigs';

export default function GigDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const gigId = params.id as string;

  const [gig, setGig] = useState<IGigWithId | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'applications'>('details');

  useEffect(() => {
    fetchGigDetails();
  }, [gigId]);

  const fetchGigDetails = async () => {
    try {
      const response = await fetch(`/api/gigs/${gigId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch gig details');
      }
      const data = await response.json();
      setGig(data.gig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gig details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseGig = async () => {
    if (!gig) return;

    try {
      const response = await fetch(`/api/gigs/${gigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CLOSED' }),
      });

      if (!response.ok) {
        throw new Error('Failed to close gig');
      }

      // Refresh gig details or redirect
      await fetchGigDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close gig');
    }
  };

  const handleDeleteGig = async () => {
    if (!confirm('Are you sure you want to delete this gig? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/gigs/${gigId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete gig');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gig');
    }
  };

  const handleUpdateGig = (updatedGig: IGigWithId) => {
    setGig(updatedGig);
    setIsEditing(false);
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

  if (!gig) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link 
            href="/dashboard/founder" 
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{gig.title}</h1>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Gig
          </button>
          {gig.status === 'OPEN' && (
            <button
              onClick={handleCloseGig}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Archive className="h-4 w-4 mr-2" />
              Close Gig
            </button>
          )}
          <button
            onClick={handleDeleteGig}
            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-2" />
            Delete Gig
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`
              ${activeTab === 'details'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
            `}
          >
            Gig Details
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
            <Users className="h-4 w-4 mr-2" />
            Applications
          </button>
        </nav>
      </div>

      {/* Content */}
              {activeTab === 'details' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{gig.description}</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Equity Range
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {gig.equity.min}% - {gig.equity.max}%
                </dd>
              </div>

              {gig.budget && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
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
                    <Clock className="h-4 w-4 mr-2" />
                    Preferred Experience
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {gig.preferredExperience}+ years
                  </dd>
                </div>
              )}

              {gig.location && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {gig.location}
                  </dd>
                </div>
              )}

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Required Skills</dt>
                <dd className="mt-1">
                  <div className="flex flex-wrap gap-2">
                    {gig.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${gig.status === 'OPEN' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'}
                  `}>
                    {gig.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <ApplicationsList founderId={gig.founder._id.toString()} />
      )}

      {/* Edit Gig Modal */}
      {isEditing && (
        <EditGigModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          gig={gig}
          onUpdate={handleUpdateGig}
        />
      )}
    </div>
  );
}

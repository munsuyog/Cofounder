// components/applications/ApplicationsList.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Github, Phone, Mail, Check, X, UserCheck, Star, GitCommit, GitPullRequest, Clock } from 'lucide-react';
import { ApplicationWithDetails } from '@/types/application';

interface ApplicationsListProps {
  founderId: string;
}

export default function ApplicationsList({ founderId }: ApplicationsListProps) {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    skills: [] as string[],
    minExperience: null as number | null,
    status: null as string | null
  });
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique skills from applications
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    applications.forEach(app => {
      app.developer.skills?.forEach(skill => skillsSet.add(skill));
    });
    return Array.from(skillsSet);
  }, [applications]);

  useEffect(() => {
    fetchApplications();
  }, [founderId]);

  useEffect(() => {
    applyFilters();
  }, [filters, applications]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/applications?founderId=${founderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data.applications);
      setFilteredApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (filters.skills.length > 0) {
      filtered = filtered.filter(app => 
        filters.skills.every(skill => app.developer.skills?.includes(skill))
      );
    }

    if (filters.minExperience !== null) {
      filtered = filtered.filter(app => 
        (app.developer.experience || 0) >= (filters.minExperience || 0)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    setFilteredApplications(filtered);
  };

  const handleStatusUpdate = async (applicationId: string, status: 'SHORTLISTED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <span className="mr-2">Filters</span>
          {filters.skills.length > 0 || filters.minExperience || filters.status ? (
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              Active filters
            </span>
          ) : null}
        </button>

        {showFilters && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      const newSkills = filters.skills.includes(skill)
                        ? filters.skills.filter(s => s !== skill)
                        : [...filters.skills, skill];
                      setFilters({ ...filters, skills: newSkills });
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.skills.includes(skill)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Experience
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={filters.minExperience || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    minExperience: e.target.value ? Number(e.target.value) : null
                  })}
                >
                  <option value="">Any experience</option>
                  <option value="1">1+ years</option>
                  <option value="2">2+ years</option>
                  <option value="5">5+ years</option>
                  <option value="8">8+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={filters.status || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    status: e.target.value || null
                  })}
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or wait for new applications.</p>
        </div>
      ) : (
        filteredApplications.map((application) => (
          <div
            key={application._id.toString()}
            className="bg-white shadow overflow-hidden sm:rounded-lg"
          >
            {/* Application Header */}
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Application for {application.gig.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    From {application.developer.firstName} {application.developer.lastName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Applied {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status and Actions */}
                <div className="flex space-x-2">
                  {application.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(application._id.toString(), 'SHORTLISTED')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application._id.toString(), 'REJECTED')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    application.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                    application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {/* GitHub Profile */}
                {application.developer.githubData && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center mb-3">
                      <Github className="h-4 w-4 mr-1" />
                      GitHub Profile
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 space-y-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={application.developer.githubData.avatar_url}
                          alt={application.developer.firstName}
                          className="h-10 w-10 rounded-full"
                        />
                        <p className="text-gray-700">{application.developer.githubData.bio}</p>
                      </div>

                      {/* GitHub Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center text-gray-700">
                            <Star className="h-4 w-4 mr-1" />
                            Repository Stars
                          </div>
                          <div className="mt-1 text-2xl font-semibold">
                            {application.developer.githubData.repositories.reduce((sum, repo) => sum + repo.stars, 0)}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center text-gray-700">
                            <GitCommit className="h-4 w-4 mr-1" />
                            Contributions
                          </div>
                          <div className="mt-1 text-2xl font-semibold">
                            {application.developer.githubData.contributions.length}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center text-gray-700">
                            <GitPullRequest className="h-4 w-4 mr-1" />
                            Public Repos
                          </div>
                          <div className="mt-1 text-2xl font-semibold">
                            {application.developer.githubData.repositories.length}
                          </div>
                        </div>
                      </div>

                      {/* Top Repositories */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Top Repositories</h4>
                        <div className="space-y-2">
                          {application.developer.githubData.repositories
                            .sort((a, b) => b.stars - a.stars)
                            .slice(0, 3)
                            .map(repo => (
                              <div key={repo.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium">{repo.name}</h5>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {repo.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center text-yellow-600">
                                    <Star className="h-4 w-4 mr-1" />
                                    {repo.stars}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {repo.language}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </dd>
                  </div>
                )}

                {/* Skills */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Skills</dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap gap-2">
                      {application.developer.skills.map((skill) => (
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

{/* Contact Info for Shortlisted Applications */}
                {application.status === 'SHORTLISTED' && (
                  <>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Contact Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a 
                          href={`mailto:${application.developer.email}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {application.developer.email}
                        </a>
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        WhatsApp Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {application.developer.whatsappNumber}
                      </dd>
                    </div>
                  </>
                )}

                {/* Expected Compensation */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Expected Compensation</dt>
                  <dd className="mt-1 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Equity Expectation</div>
                      <div className="mt-1 text-lg font-medium text-gray-900">
                        {application.expectedEquity}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {/* Range: {application.gig.equity.min}% - {application.gig.equity.max}% */}
                      </div>
                    </div>

                    {application.expectedBudget && application.gig.budget && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Budget Expectation</div>
                        <div className="mt-1 text-lg font-medium text-gray-900">
                          {application.expectedBudget.toLocaleString()} {application.gig.budget.currency}
                        </div>
                        <div className="text-xs text-gray-500">
                          Range: {application.gig.budget.min.toLocaleString()} - {application.gig.budget.max.toLocaleString()} {application.gig.budget.currency}
                        </div>
                      </div>
                    )}
                  </dd>
                </div>

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Cover Letter</dt>
                    <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                      {application.coverLetter}
                    </dd>
                  </div>
                )}

                {/* Experience and Other Details */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Experience & Details</dt>
                  <dd className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Years of Experience</div>
                      <div className="mt-1 font-medium text-gray-900">
                        {application.developer.experience || 0} years
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Total Repositories</div>
                      <div className="mt-1 font-medium text-gray-900">
                        {application.developer.githubData?.repositories.length || 0}
                      </div>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Application Timeline/History - if needed */}
            {application.status !== 'PENDING' && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Status updated: {new Date(application.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
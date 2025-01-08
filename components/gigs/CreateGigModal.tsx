// components/gigs/CreateGigModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CreateGigInput } from '@/types/gigs';

interface CreateGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  founderId: string;
}

export default function CreateGigModal({ isOpen, onClose, founderId }: CreateGigModalProps) {
  const [formData, setFormData] = useState<CreateGigInput>({
    title: '',
    description: '',
    equityMin: 0,
    equityMax: 0,
    budgetMin: undefined,
    budgetMax: undefined,
    currency: 'USD',
    requiredSkills: [],
    preferredExperience: undefined,
    location: '',
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          founderId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create gig');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = () => {
    if (currentSkill && !formData.requiredSkills.includes(currentSkill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, currentSkill]
      }));
      setCurrentSkill('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Gig</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Equity (%)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.equityMin}
                onChange={(e) => setFormData(prev => ({ ...prev, equityMin: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Equity (%)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.equityMax}
                onChange={(e) => setFormData(prev => ({ ...prev, equityMax: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Budget</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.budgetMin || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: Number(e.target.value) || undefined }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Budget</label>
              <input
                type="number"
                min="0"
                // components/gigs/CreateGigModal.tsx continued...
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.budgetMax || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: Number(e.target.value) || undefined }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Required Skills</label>
            <div className="mt-1 flex">
              <input
                type="text"
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
              />
              <button
                type="button"
                onClick={handleSkillAdd}
                className="ml-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
                    }))}
                    className="ml-1.5 inline-flex items-center px-0.5 py-0.5 text-indigo-400 hover:text-indigo-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Experience (years)</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.preferredExperience || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredExperience: Number(e.target.value) || undefined }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Gig'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
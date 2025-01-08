// components/developer/ApplyModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { IGigWithId } from '@/types/gigs';

interface ApplyModalProps {
  gig: IGigWithId;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ gig, userId, onClose, onSuccess }: ApplyModalProps) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedEquity: gig.equity.min,
    expectedBudget: gig.budget?.min || 0,
    acceptedTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    if (!formData.acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gigId: gig._id,
          developerId: userId,
          coverLetter: formData.coverLetter,
          expectedEquity: formData.expectedEquity,
          expectedBudget: formData.expectedBudget,
          acceptedTerms: formData.acceptedTerms  // Add this line
        }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit application');
      }
  
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Apply for {gig.title}</h2>
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
            <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
            <p className="mt-1 text-sm text-gray-500">
              Explain why you're interested in this opportunity and what makes you a great fit.
            </p>
            <textarea
              required
              rows={6}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              placeholder="Write your cover letter here..."
            />
          </div>

          // components/developer/ApplyModal.tsx continued...
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expected Equity (%)
              </label>
              <input
                type="number"
                min={gig.equity.min}
                max={gig.equity.max}
                step="0.1"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.expectedEquity}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedEquity: parseFloat(e.target.value) }))}
              />
              <p className="mt-1 text-xs text-gray-500">
                Range: {gig.equity.min}% - {gig.equity.max}%
              </p>
            </div>

            {gig.budget && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expected Budget ({gig.budget.currency})
                </label>
                <input
                  type="number"
                  min={gig.budget.min}
                  max={gig.budget.max}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.expectedBudget}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedBudget: parseInt(e.target.value) }))}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Range: {gig.budget.min} - {gig.budget.max} {gig.budget.currency}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <h4 className="font-medium mb-2">Terms and Conditions</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>I understand that my GitHub profile information will be shared with the founder.</li>
                <li>I confirm that I am available for this opportunity and can commit the necessary time.</li>
                <li>I agree to maintain confidentiality regarding any project details discussed.</li>
                <li>I understand that applying does not guarantee a partnership.</li>
                <li>If shortlisted, I agree to respond to the founder's communication within 48 hours.</li>
              </ul>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                />
              </div>
              <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                I have read and agree to the above terms and conditions
              </label>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.acceptedTerms}
              className="flex-1 inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
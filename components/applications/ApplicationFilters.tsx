// components/applications/ApplicationFilters.tsx
import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FiltersProps {
  allSkills: string[];
  onFilterChange: (filters: {
    skills: string[];
    minExperience: number | null;
    status: string | null;
  }) => void;
}

export default function ApplicationFilters({ allSkills, onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minExperience, setMinExperience] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    onFilterChange({ skills: newSkills, minExperience, status });
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setMinExperience(null);
    setStatus(null);
    onFilterChange({ skills: [], minExperience: null, status: null });
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
          {(selectedSkills.length > 0 || minExperience || status) && (
            <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
              {selectedSkills.length + (minExperience ? 1 : 0) + (status ? 1 : 0)}
            </span>
          )}
        </button>
        {(selectedSkills.length > 0 || minExperience || status) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedSkills.includes(skill)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Experience</h4>
            <select
              value={minExperience || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                setMinExperience(value);
                onFilterChange({ skills: selectedSkills, minExperience: value, status });
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Any experience</option>
              <option value="1">1+ years</option>
              <option value="2">2+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="8">8+ years</option>
            </select>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
            <select
              value={status || ''}
              onChange={(e) => {
                const value = e.target.value || null;
                setStatus(value);
                onFilterChange({ skills: selectedSkills, minExperience, status: value });
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
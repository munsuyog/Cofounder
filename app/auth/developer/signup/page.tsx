// app/(auth)/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

// Country codes for WhatsApp
const COUNTRY_CODES = [
  { code: '+1', country: 'United States' },
  { code: '+91', country: 'India' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
  { code: '+61', country: 'Australia' },
  { code: '+7', country: 'Russia' },
  { code: '+33', country: 'France' },
  { code: '+55', country: 'Brazil' },
];

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  location: string;
  skills: string[];
  experience: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    location: '',
    skills: [],
    experience: '',
    whatsappCountryCode: '+91', // Default to India
    whatsappNumber: '',
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSkillAdd = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    const validations = [
      { 
        condition: formData.email.trim() === '', 
        message: 'Email is required' 
      },
      { 
        condition: !/\S+@\S+\.\S+/.test(formData.email), 
        message: 'Invalid email format' 
      },
      { 
        condition: formData.password.length < 8, 
        message: 'Password must be at least 8 characters' 
      },
      { 
        condition: formData.firstName.trim() === '', 
        message: 'First name is required' 
      },
      { 
        condition: formData.lastName.trim() === '', 
        message: 'Last name is required' 
      },
      { 
        condition: formData.skills.length === 0, 
        message: 'Please add at least one skill' 
      }
    ];

    const failedValidation = validations.find(val => val.condition);
    if (failedValidation) {
      setError(failedValidation.message);
      setLoading(false);
      return;
    }

    // Validate WhatsApp number (only digits)
    const sanitizedNumber = formData.whatsappNumber.replace(/\D/g, '');
    if (!sanitizedNumber) {
      setError('Please enter a valid WhatsApp number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/developer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          experience: Number(formData.experience) || undefined,
          whatsappNumber: Number(`${formData.whatsappCountryCode.replace('+', '')}${sanitizedNumber}`)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      localStorage.setItem('userId', data.user._id);
      router.push('/auth/developer/signup/connect');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      {/* Password Field */}
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
        <p className="mt-1 text-xs text-gray-500">
          At least 8 characters long
        </p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
      </div>

      {/* WhatsApp Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          WhatsApp Number
        </label>
        <div className="mt-1 flex">
          <select
            className="block w-1/3 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.whatsappCountryCode}
            onChange={(e) => setFormData(prev => ({ ...prev, whatsappCountryCode: e.target.value }))}
          >
            {COUNTRY_CODES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            required
            placeholder="WhatsApp Number"
            className="block w-2/3 rounded-r-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.whatsappNumber}
            onChange={(e) => {
              // Allow only digits
              const value = e.target.value.replace(/\D/g, '');
              setFormData(prev => ({ ...prev, whatsappNumber: value }));
            }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          We'll use this for important communications
        </p>
      </div>

      {/* Location Field */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          id="location"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
        />
      </div>

      {/* Skills Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Skills</label>
        <div className="mt-1 flex">
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
            placeholder="Add skills (Press Enter to add)"
          />
          <button
            type="button"
            onClick={handleSkillAdd}
            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleSkillRemove(skill)}
                className="ml-1.5 inline-flex items-center px-0.5 py-0.5 text-indigo-400 hover:text-indigo-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Experience Field */}
      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
          Years of experience
        </label>
        <input
          id="experience"
          type="number"
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.experience}
          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}
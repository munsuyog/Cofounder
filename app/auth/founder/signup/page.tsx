'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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
  companyName: string;
  industry: string;
  location?: string;
  fundingStage?: string;
  teamSize?: number;
  whatsappNumber: string;
  whatsappCountryCode: string;
}

export default function FounderSignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    industry: '',
    location: '',
    fundingStage: '',
    teamSize: undefined,
    whatsappCountryCode: '+91', // Default to India
    whatsappNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fundingStages = [
    'PRE_SEED',
    'SEED',
    'SERIES_A',
    'SERIES_B',
    'SERIES_C',
    'BOOTSTRAPPED'
  ];

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
        condition: formData.companyName.trim() === '', 
        message: 'Company name is required' 
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
      const response = await fetch('/api/auth/founder/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          whatsappNumber: Number(`${formData.whatsappCountryCode.replace('+', '')}${sanitizedNumber}`)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store user data
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userEmail', data.user.email);
      
      // Redirect to dashboard
      router.push('/dashboard/founder');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
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
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="block w-1/3 rounded-l-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="block w-2/3 rounded-r-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          Company name
        </label>
        <input
          id="companyName"
          type="text"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
        />
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
          Industry
        </label>
        <input
          id="industry"
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.industry}
          onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
        />
      </div>

      {/* Funding Stage */}
      <div>
        <label htmlFor="fundingStage" className="block text-sm font-medium text-gray-700">
          Funding stage
        </label>
        <select
          id="fundingStage"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.fundingStage}
          onChange={(e) => setFormData(prev => ({ ...prev, fundingStage: e.target.value }))}
        >
          <option value="">Select stage</option>
          {fundingStages.map((stage) => (
            <option key={stage} value={stage}>
              {stage.replace('_', ' ').toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Team Size */}
      <div>
        <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">
          Team size
        </label>
        <input
          id="teamSize"
          type="number"
          min="1"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.teamSize || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) || undefined }))}
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          id="location"
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </div>
    </form>
  );
}
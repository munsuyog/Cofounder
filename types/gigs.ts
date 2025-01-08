// types/gig.ts
import { Types } from 'mongoose';

export interface IGig {
  founder: Types.ObjectId;
  title: string;
  description: string;
  equity: {
    min: number;
    max: number;
  };
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  requiredSkills: string[];
  preferredExperience?: number;
  status: 'OPEN' | 'CLOSED';
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApplication {
  _id: Types.ObjectId;
  gig: Types.ObjectId;
  developer: Types.ObjectId;
  status: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
  coverLetter?: string;
  expectedEquity?: number;
  expectedBudget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGigInput {
  title: string;
  description: string;
  equityMin: number;
  equityMax: number;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  requiredSkills: string[];
  preferredExperience?: number;
  location?: string;
}

export interface IGigWithId extends IGig {
  _id: Types.ObjectId;
  founder: Types.ObjectId & {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}
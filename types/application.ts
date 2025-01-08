import { Types } from 'mongoose';
import { IGig, IGigWithId } from './gigs';
import { GithubContribution } from './github';

export interface IApplication {
  _id: Types.ObjectId;
  gig: Types.ObjectId | IGig;
  developer: Types.ObjectId;
  status: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
  coverLetter?: string;
  expectedEquity?: number;
  expectedBudget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GithubRepository {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
}

export interface GithubData {
  id: string;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  repositories: GithubRepository[];
  contributions: GithubContribution[];
}


export interface DeveloperDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  githubId?: string;
  githubData?: GithubData;
  skills: string[];
  experience?: number;
  whatsappNumber: string;
  whatsappCountryCode: string;
}

export interface GigDetails {
  _id: string;
  title: string;
}

export interface ApplicationWithDetails {
  _id: string;
  status: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
  coverLetter?: string;
  expectedEquity?: number;
  expectedBudget?: number;
  createdAt: Date;
  updatedAt: Date;
  developer: DeveloperDetails;
  gig: IGigWithId;
}


export interface PopulatedApplication {
  _id: Types.ObjectId;
  gig: {
    _id: Types.ObjectId;
    title: string;
    budget?: {
      currency: string;
    };
  };
  developer: Types.ObjectId;
  status: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
  coverLetter?: string;
  expectedEquity?: number;
  expectedBudget?: number;
  createdAt: Date;
  updatedAt: Date;
}

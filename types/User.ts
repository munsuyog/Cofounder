import { Document, Types } from 'mongoose';

// Enums as const objects
export const UserRole = {
  DEVELOPER: 'DEVELOPER',
  FOUNDER: 'FOUNDER'
} as const;

export const UserStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED'
} as const;

export const FundingStage = {
  PRE_SEED: 'PRE_SEED',
  SEED: 'SEED',
  SERIES_A: 'SERIES_A',
  SERIES_B: 'SERIES_B',
  SERIES_C: 'SERIES_C',
  BOOTSTRAPPED: 'BOOTSTRAPPED'
} as const;

// Types derived from const objects
export type UserRole = typeof UserRole[keyof typeof UserRole];
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];
export type FundingStage = typeof FundingStage[keyof typeof FundingStage];

// Base Interfaces
export interface BaseUserFields {
  email: string;
  firstName: string;
  lastName: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
}

// Social Data Interfaces
export interface IGithubData {
  id: string;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  repositories: Array<{
    id: string;
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
  }>;
  contributions: any[];
}

export interface ILinkedinData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
  }>;
}

// Role-specific fields
export interface DeveloperFields {
  githubId?: string;
  githubData?: IGithubData;
  linkedinId?: string;
  linkedinData?: ILinkedinData;
  skills: string[];
  experience?: number;
}

export interface FounderFields {
  companyName: string;
  industry?: string;
  fundingStage?: FundingStage;
  teamSize?: number;
}

// User interface without Document fields
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  githubId?: string;
  githubData?: IGithubData;
  linkedinId?: string;
  linkedinData?: ILinkedinData;
  skills?: string[];
  experience?: number;
  companyName?: string;
  industry?: string;
  fundingStage?: FundingStage;
  teamSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Document interface
export interface IUserDocument extends Omit<IUser, keyof Document>, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Signup Data Types
export interface ISignupBase extends BaseUserFields {
  password: string;
}

export interface IDeveloperSignupData extends ISignupBase {
  skills: string[];
  experience?: number;
}

export interface IFounderSignupData extends ISignupBase {
  companyName: string;
  industry?: string;
  fundingStage?: FundingStage;
  teamSize?: number;
}

// API Response Types
export interface ApiResponse {
  success: boolean;
  message?: string;  // Make message optional in base interface
  error?: string;
}

export interface UserResponse extends ApiResponse {
  user?: Omit<IUser, 'password'>;
}

export interface SignupResponse extends ApiResponse {
  user?: Omit<IUser, 'password'>;
}

// Utility Types
export type UserWithoutPassword = Omit<IUser, 'password'>;
export type DeveloperUser = IUser & Required<Pick<DeveloperFields, 'skills'>>;
export type FounderUser = IUser & Required<Pick<FounderFields, 'companyName'>>;

// Request Types
export interface SocialConnectRequest {
  userId: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidatedResponse<T> extends ApiResponse {
  data?: T;
  errors?: ValidationError[];
}

// Type Guards
export const isDeveloper = (user: IUser): user is DeveloperUser => {
  return user.role === UserRole.DEVELOPER && Array.isArray(user.skills);
};

export const isFounder = (user: IUser): user is FounderUser => {
  return user.role === UserRole.FOUNDER && typeof user.companyName === 'string';
};
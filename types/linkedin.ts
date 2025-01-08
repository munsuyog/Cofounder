// types/linkedin.ts
export interface LinkedInExperience {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
  }
  
  export interface ILinkedinData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    experience: LinkedInExperience[];
  }
import { IUser } from "./User";

export interface ApiResponse {
    message: string;
    error?: string;
  }
  
  export interface UserResponse extends ApiResponse {
    user?: Omit<IUser, 'password'>;
  }
  
  export interface SocialConnectRequest {
    userId: string;
    code: string;
  }
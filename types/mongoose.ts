import { Document, Model } from 'mongoose';
import { IUser } from './User';

export interface IUserDocument extends Omit<IUser, keyof Document>, Document {}

export interface IUserModel extends Model<IUserDocument> {
  // Add any static methods here if needed
  findByEmail(email: string): Promise<IUserDocument | null>;
}
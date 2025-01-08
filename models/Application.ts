// models/Application.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IApplication } from '@/types/gigs';
import { GigSchema, IGigDocument } from './Gig';

export interface IApplicationDocument extends Omit<IApplication, keyof Document>, Document {}

const ApplicationSchema = new Schema({
  gig: {
    type: Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  developer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SHORTLISTED', 'REJECTED'],
    default: 'PENDING'
  },
  coverLetter: String,
  expectedEquity: Number,
  expectedBudget: Number
}, {
  timestamps: true
});

export const Gig = mongoose.models.Gig || mongoose.model<IGigDocument>('Gig', GigSchema);
export const Application = mongoose.models.Application || 
  mongoose.model<IApplicationDocument>('Application', ApplicationSchema);
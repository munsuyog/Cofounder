// models/Gig.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IGig } from '@/types/gigs';

export interface IGigDocument extends IGig, Document {}

export const GigSchema = new Schema({
  founder: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  equity: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requiredSkills: [{
    type: String,
    required: true
  }],
  preferredExperience: Number,
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN'
  },
  location: String
}, {
  timestamps: true
});
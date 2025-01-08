// app/api/applications/gig/[id]/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Application } from '@/models/Application';

// Define a type for the formatted application
interface FormattedApplication {
    _id: string;
    gig: string;
    developer: string; // or replace with a more detailed developer object type
    status: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
    coverLetter?: string;
    expectedEquity?: number;
    expectedBudget?: number;
    createdAt: Date;
    updatedAt: Date;
  }

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = context.params.id;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid gig ID format',
        applications: []
      });
    }

    // Find all applications for this gig with populated developer details
    const applications = await Application.find({
      gig: new Types.ObjectId(id)
    })
    .populate({
      path: 'developer',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'gig',
      select: 'title description equity budget status location'
    })
    .lean()
    .sort({ createdAt: -1 });

    // Format the response with null checks
    const formattedApplications: FormattedApplication[] = applications.map(app => ({
        _id: (app._id as Types.ObjectId).toString(),
        gig: (app.gig as Types.ObjectId).toString(),
        developer: (app.developer as Types.ObjectId).toString(),
        status: app.status || 'PENDING',
        coverLetter: app.coverLetter || '',
        expectedEquity: app.expectedEquity || 0,
        expectedBudget: app.expectedBudget || 0,
        createdAt: app.createdAt || new Date(),
        updatedAt: app.updatedAt || new Date(),
      }));

    return NextResponse.json({
      success: true,
      applications: formattedApplications
    });

  } catch (error) {
    console.error('Get gig applications error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch applications',
      applications: [] // Always return an array, even if empty
    });
  }
}
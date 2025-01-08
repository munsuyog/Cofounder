// app/api/applications/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { Gig } from '@/models/Application';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const founderId = searchParams.get('founderId');

    if (!founderId) {
      return NextResponse.json(
        { error: 'Founder ID is required' },
        { status: 400 }
      );
    }

    // Find all gigs for this founder
    const gigs = await Gig.find({ founder: founderId });
    const gigIds = gigs.map(gig => gig._id);

    // Find applications for these gigs
    const applications = await Application.find({ gig: { $in: gigIds } })
      .populate('developer', 'firstName lastName email githubId githubData skills experience')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      gigId, 
      developerId, 
      coverLetter, 
      expectedEquity, 
      expectedBudget,
      acceptedTerms 
    } = body;

    // Validation
    if (!gigId || !developerId || !coverLetter) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!Types.ObjectId.isValid(gigId) || !Types.ObjectId.isValid(developerId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    if (gig.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'This opportunity is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if developer has already applied
    const existingApplication = await Application.findOne({
      gig: new Types.ObjectId(gigId),
      developer: new Types.ObjectId(developerId)
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this opportunity' },
        { status: 400 }
      );
    }

    // Validate equity expectations
    if (expectedEquity) {
      if (expectedEquity < gig.equity.min || expectedEquity > gig.equity.max) {
        return NextResponse.json(
          { error: 'Expected equity must be within the specified range' },
          { status: 400 }
        );
      }
    }

    // Validate budget expectations
    if (expectedBudget && gig.budget) {
      if (expectedBudget < gig.budget.min || expectedBudget > gig.budget.max) {
        return NextResponse.json(
          { error: 'Expected budget must be within the specified range' },
          { status: 400 }
        );
      }
    }

    // Create application
    const application = await Application.create({
      gig: new Types.ObjectId(gigId),
      developer: new Types.ObjectId(developerId),
      coverLetter,
      expectedEquity,
      expectedBudget,
      status: 'PENDING'
    });

    // Populate the response
    const populatedApplication = await Application.findById(application._id)
      .populate('gig', 'title description equity budget status')
      .populate('developer', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApplication
    });

  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
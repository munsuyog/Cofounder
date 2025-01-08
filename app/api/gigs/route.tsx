// app/api/gigs/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Gig } from '@/models/Application';
import { Types } from 'mongoose';

// Get gigs
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const founderId = searchParams.get('founderId');

    const query = founderId ? { founder: new Types.ObjectId(founderId) } : {};
    const gigs = await Gig.find(query)
      .populate('founder', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      gigs
    });

  } catch (error) {
    console.error('Get gigs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gigs' },
      { status: 500 }
    );
  }
}

// Create gig
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      founderId,
      title,
      description,
      equityMin,
      equityMax,
      budgetMin,
      budgetMax,
      currency,
      requiredSkills,
      preferredExperience,
      location 
    } = body;

    // Validate required fields
    if (!founderId || !title || !description || !requiredSkills || equityMin === undefined || equityMax === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create gig
    const gig = await Gig.create({
      founder: new Types.ObjectId(founderId),
      title,
      description,
      equity: {
        min: equityMin,
        max: equityMax
      },
      budget: budgetMin || budgetMax ? {
        min: budgetMin,
        max: budgetMax,
        currency: currency || 'USD'
      } : undefined,
      requiredSkills,
      preferredExperience,
      location
    });

    await gig.populate('founder', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      gig
    });

  } catch (error) {
    console.error('Create gig error:', error);
    return NextResponse.json(
      { error: 'Failed to create gig' },
      { status: 500 }
    );
  }
}


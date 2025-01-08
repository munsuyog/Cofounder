// app/api/gigs/[id]/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Gig } from '@/models/Application';
import { Types } from 'mongoose';

// Get single gig
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid gig ID' },
        { status: 400 }
      );
    }

    const gig = await Gig.findById(params.id)
      .populate('founder', 'firstName lastName email');

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      gig
    });

  } catch (error) {
    console.error('Get gig error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gig' },
      { status: 500 }
    );
  }
}

// Update gig
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid gig ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = {
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
      ...(body.equityMin && body.equityMax && {
        equity: {
          min: body.equityMin,
          max: body.equityMax
        }
      }),
      ...(body.budgetMin || body.budgetMax ? {
        budget: {
          min: body.budgetMin,
          max: body.budgetMax,
          currency: body.currency || 'USD'
        }
      } : {}),
      ...(body.requiredSkills && { requiredSkills: body.requiredSkills }),
      ...(body.preferredExperience && { preferredExperience: body.preferredExperience }),
      ...(body.location && { location: body.location }),
      ...(body.status && { status: body.status })
    };

    const gig = await Gig.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('founder', 'firstName lastName email');

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      gig
    });

  } catch (error) {
    console.error('Update gig error:', error);
    return NextResponse.json(
      { error: 'Failed to update gig' },
      { status: 500 }
    );
  }
}

// Delete gig
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid gig ID' },
        { status: 400 }
      );
    }

    const gig = await Gig.findByIdAndDelete(params.id);

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Gig deleted successfully'
    });

  } catch (error) {
    console.error('Delete gig error:', error);
    return NextResponse.json(
      { error: 'Failed to delete gig' },
      { status: 500 }
    );
  }
}
// app/api/applications/developer/[id]/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Application } from '@/models/Application';

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
        error: 'Invalid developer ID format',
        applications: []
      });
    }

    // Find all applications for this developer with populated gig details
    const applications = await Application.find({
      developer: new Types.ObjectId(id)
    })
    .populate({
      path: 'gig',
      select: 'title description equity budget status location requiredSkills createdAt founder',
      populate: {
        path: 'founder',
        select: 'firstName lastName email'
      }
    })
    .lean() // Convert to plain JavaScript object
    .sort({ createdAt: -1 });

    // Format the response with null checks
    const formattedApplications = applications.map(app => ({
        ...app,
        _id: (app._id as Types.ObjectId).toString(),
        gig: app.gig ? {
          ...app.gig,
          _id: (app.gig._id as Types.ObjectId).toString()
        } : null
      }));

    return NextResponse.json({
      success: true,
      applications: formattedApplications
    });

  } catch (error) {
    console.error('Get developer applications error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch applications',
      applications: [] // Always return an array, even if empty
    });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = context.params.id;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid application ID format'
      }, { status: 400 });
    }

    const application = await Application.findById(id);

    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found'
      }, { status: 404 });
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json({
        success: false,
        error: 'Only pending applications can be withdrawn'
      }, { status: 400 });
    }

    await Application.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to withdraw application'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = context.params.id;
    const { status } = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid application ID format'
      }, { status: 400 });
    }

    if (!['PENDING', 'SHORTLISTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status'
      }, { status: 400 });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate({
      path: 'gig',
      select: 'title description equity budget status location',
      populate: {
        path: 'founder',
        select: 'firstName lastName email'
      }
    })
    .lean();

    if (!updatedApplication) {
      return NextResponse.json({
        success: false,
        error: 'Application not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication
    });

  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update application status'
    }, { status: 500 });
  }
}
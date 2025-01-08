import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { sendStatusUpdateEmail } from '@/lib/email';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body
    const { status } = await request.json();

    // Validate status
    const ALLOWED_STATUSES = ['SHORTLISTED', 'REJECTED'];
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find and update the application
    const application = await Application.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).populate([
      {
        path: 'developer',
        select: 'firstName lastName email phone'
      },
      {
        path: 'gig',
        select: 'title founder',
        populate: {
          path: 'founder',
          select: 'firstName lastName email phone'
        }
      }
    ]);

    // Check if application exists
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Send notifications if shortlisted
    if (status === 'SHORTLISTED') {
      // Destructure data for email and notification
      const {
        developer: {
          firstName: developerFirstName,
          lastName: developerLastName,
          email: developerEmail,
          phone: developerPhone
        },
        gig: {
          title: gigTitle,
          founder: {
            firstName: founderFirstName,
            lastName: founderLastName,
            email: founderEmail,
            phone: founderPhone
          }
        }
      } = application;

      // Send email to developer
      await sendStatusUpdateEmail({
        to: developerEmail,
        name: `${developerFirstName} ${developerLastName}`,
        gigTitle,
        founderName: `${founderFirstName} ${founderLastName}`,
        founderEmail
      });

      // Send WhatsApp notification if phone numbers are available
      if (developerPhone && founderPhone) {
        await sendWhatsAppNotification({
          to: developerPhone,
          message: `Congratulations! You've been shortlisted for the position "${gigTitle}". The founder will contact you soon.`,
          founderPhone
        });
      }
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      application
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Update application status error:', error);

    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to update application status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
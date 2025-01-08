import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { sendStatusUpdateEmail } from '@/lib/email';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { status } = await request.json();

    if (!['SHORTLISTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

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

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Send notifications if shortlisted
    if (status === 'SHORTLISTED') {
    //   Send email to developer
      await sendStatusUpdateEmail({
        to: application.developer.email,
        name: `${application.developer.firstName} ${application.developer.lastName}`,
        gigTitle: application.gig.title,
        founderName: `${application.gig.founder.firstName} ${application.gig.founder.lastName}`,
        founderEmail: application.gig.founder.email
      });

      // Send WhatsApp notification if phone numbers are available
      if (application.developer.phone && application.gig.founder.phone) {
        await sendWhatsAppNotification({
          to: application.developer.phone,
          message: `Congratulations! You've been shortlisted for the position "${application.gig.title}". The founder will contact you soon.`,
          founderPhone: application.gig.founder.phone
        });
      }
    }

    return NextResponse.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}
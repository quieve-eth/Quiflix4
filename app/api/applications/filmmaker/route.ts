// Temporary in-memory storage until database tables are created
const applications: any[] = [];

export async function POST(req: Request) {
  try {
    const formData = await req.json();

    const application = {
      id: Math.random().toString(36).substring(7),
      ...formData,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    applications.push(application);

    // Send email to Quiflix@proton.me with application details
    try {
      console.log('[v0] Filmmaker application submitted:', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        filmTitle: formData.filmTitle,
        country: formData.country,
      });

      // TODO: Configure email service (Resend, SendGrid, or your email provider)
      // await sendApplicationEmail(application);
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError);
    }

    return Response.json(
      {
        success: true,
        message: 'Application submitted successfully! We will review your application and send you an email within 48 hours.',
        data: application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    {
      applications,
      message: 'Note: This is temporary in-memory storage. Set up the Supabase database tables for persistent storage.',
    },
    { status: 200 }
  );
}

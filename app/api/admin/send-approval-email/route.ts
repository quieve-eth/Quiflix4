import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, type, status, personalizedLink, referralCode, companyName, trailerUrl, filmTitle, filmData } = await req.json();

    if (!email || !type || !status) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let subject = '';
    let html = '';

    if (status === 'approved') {
      subject = type === 'filmmaker'
        ? 'Congratulations! Your Film Application is Approved'
        : 'Congratulations! Your Distributor Application is Approved';

      html = type === 'filmmaker'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #D4AF37;">Welcome to Quiflix!</h2>
            <p>We're excited to inform you that your film application has been approved.</p>
            <p>Your film is now eligible for distribution on our platform. Our team will contact you shortly with next steps.</p>
            <p>Best regards,<br/>The Quiflix Team</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #D4AF37;">Welcome to Quiflix, ${companyName || 'Distributor'}!</h2>
            <p>We're thrilled to inform you that your distributor application has been approved!</p>
            
            ${trailerUrl ? `
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #000; margin-top: 0;">🎬 Download Film Trailer</h3>
                <p style="font-size: 14px; color: #666; margin: 10px 0;">Share this trailer on social media to promote the film:</p>
                <div style="background: #fff; border: 2px solid #D4AF37; padding: 12px; border-radius: 4px; margin: 10px 0; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #000; font-weight: bold;">${filmTitle}</p>
                  <a href="${trailerUrl}?download=true" style="display: inline-block; background: #D4AF37; color: #000; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 5px;">
                    Download Trailer
                  </a>
                  <p style="font-size: 12px; color: #999; margin: 10px 0;">Direct Link: <a href="${trailerUrl}" style="color: #D4AF37;">${trailerUrl.substring(0, 50)}...</a></p>
                </div>
                <p style="font-size: 12px; color: #666; margin: 10px 0;"><strong>Social Media Tips:</strong></p>
                <ul style="font-size: 12px; color: #666; margin: 0; padding-left: 20px;">
                  <li>Post trailer snippets on Instagram Reels & TikTok</li>
                  <li>Share on YouTube Shorts</li>
                  <li>Use in Facebook & LinkedIn posts</li>
                  <li>Include in marketing emails with your distribution link</li>
                </ul>
              </div>
            ` : ''}
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #000; margin-top: 0;">Your Personalized Distribution Link</h3>
              <p style="font-size: 14px; color: #666; margin: 10px 0;">Share this link with audiences to start earning 20% of every sale:</p>
              <div style="background: #fff; border: 2px solid #D4AF37; padding: 12px; border-radius: 4px; word-break: break-all;">
                <a href="${personalizedLink}" style="color: #D4AF37; text-decoration: none; font-weight: bold;">
                  ${personalizedLink}
                </a>
              </div>
              <p style="font-size: 12px; color: #999; margin: 10px 0;">Referral Code: <code>${referralCode}</code></p>
              <p style="font-size: 12px; color: #666; margin: 10px 0;"><strong>Note:</strong> Every purchase made through your link earns you 20% automatically.</p>
            </div>

            <p><strong>What You've Earned:</strong></p>
            <ul style="color: #000;">
              <li>1 Digital Distribution Token (DDT) for this film</li>
              <li>20% commission on all sales made through your link</li>
              <li>Access to real-time sales and earnings dashboard</li>
              <li>Ready-to-share trailer for social media promotion</li>
            </ul>

            <p><strong>Getting Started:</strong></p>
            <ol style="color: #000;">
              <li><strong>Download & Share</strong> - Download the trailer and share on all social platforms</li>
              <li><strong>Share Your Link</strong> - Promote your personalized distribution link in all posts</li>
              <li><strong>Track Earnings</strong> - Log in to your distributor dashboard to monitor sales in real-time</li>
              <li><strong>Get Paid</strong> - Receive automatic payouts to your connected wallet</li>
            </ol>

            <div style="background: #fff3cd; border-left: 4px solid #D4AF37; padding: 12px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #000; font-size: 13px;">
                <strong>💡 Pro Tip:</strong> Combine the trailer download with your personalized link for maximum impact. Each share drives potential customers directly to your earning link!
              </p>
            </div>

            <p style="margin-top: 30px;">Best regards,<br/>The Quiflix Team</p>
          </div>
        `;
    } else {
      subject = type === 'filmmaker'
        ? 'Your Film Application Status'
        : 'Your Distributor Application Status';

      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Application Update</h2>
          <p>Thank you for your interest in Quiflix. Unfortunately, your application was not approved at this time.</p>
          <p>We encourage you to apply again in the future. If you have any questions, please contact us at Quiflix@proton.me</p>
          <p>Best regards,<br/>The Quiflix Team</p>
        </div>
      `;
    }

    const result = await resend.emails.send({
      from: 'Quiflix <noreply@quiflix.com>',
      to: email,
      subject,
      html,
    });

    if (result.error) {
      console.error('Email error:', result.error);
      return Response.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Email sent successfully',
      result,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

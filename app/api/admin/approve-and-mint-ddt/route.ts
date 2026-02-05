import { createClient } from '@/lib/supabase/server';
import { assignDDTToDistributor, approveFilmAndMintDDTs } from '@/lib/ddt/contract';
import { generateReferralCode, createReferralLink } from '@/lib/ddt/referral';

/**
 * API Route: Approve Distributor and Assign 1 DDT
 * 
 * When an admin approves a distributor application:
 * 1. Update status in database
 * 2. Register distributor on smart contract
 * 3. Assign 1 DDT to the distributor for the specified film
 * 4. Generate personalized distribution link
 * 5. Send approval email
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      distributorId, 
      filmId, 
      distributorEmail, 
      distributorWallet,
      contractAddress
    } = body;

    console.log('[v0] DDT Assignment - Approving distributor:', {
      distributorId,
      filmId,
      distributorEmail,
    });

    if (!distributorId || !filmId || !distributorWallet || !contractAddress) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Update distributor status to approved in database
    const { error: updateError } = await supabase
      .from('distributors')
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
      })
      .eq('id', distributorId);

    if (updateError) {
      console.error('[v0] Error updating distributor:', updateError);
      return Response.json(
        { error: 'Failed to update distributor status' },
        { status: 500 }
      );
    }

    // 2. Assign 1 DDT to the distributor on smart contract
    try {
      const txHash = await assignDDTToDistributor(
        contractAddress,
        parseInt(filmId),
        parseInt(distributorId)
      );

      console.log('[v0] DDT Assigned on-chain:', { txHash, distributorId, filmId });

      // 3. Generate personalized distribution link with unique referral code
      const referralCode = generateReferralCode();
      const personalizedLink = createReferralLink(referralCode, filmId);

      // 4. Create DDT holding record in database
      const { data: holdingData, error: holdingError } = await supabase
        .from('ddt_holdings')
        .insert({
          distributor_id: distributorId,
          film_id: filmId,
          ddt_balance: 1,
          personalized_link: personalizedLink,
          active: true,
        })
        .select()
        .single();

      if (holdingError) {
        console.error('[v0] Error creating DDT holding:', holdingError);
      }

      // 5. Fetch film details including trailer
      const { data: filmData, error: filmError } = await supabase
        .from('films')
        .select('*')
        .eq('id', filmId)
        .single();

      if (filmError) {
        console.error('[v0] Error fetching film data:', filmError);
      }

      // 6. Send approval email with personalized link and trailer
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/send-approval-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: distributorEmail,
            type: 'distributor',
            status: 'approved',
            personalizedLink,
            referralCode,
            trailerUrl: filmData?.trailer_url,
            filmTitle: filmData?.title,
            filmData: filmData,
          }),
        });
      } catch (emailError) {
        console.error('[v0] Email sending failed:', emailError);
      }

      console.log('[v0] Approval email sent to:', distributorEmail);
      console.log('[v0] Personalized link:', personalizedLink);

      return Response.json(
        {
          success: true,
          message: 'Distributor approved and DDT assigned',
          data: {
            distributorId,
            filmId,
            txHash,
            personalizedLink,
          },
        },
        { status: 200 }
      );
    } catch (blockchainError) {
      console.error('[v0] Blockchain error:', blockchainError);
      // Even if blockchain fails, we've updated the database
      return Response.json(
        {
          success: false,
          error: 'Blockchain transaction failed',
          details: blockchainError instanceof Error ? blockchainError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[v0] API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

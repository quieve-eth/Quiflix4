import { createClient } from '@/lib/supabase/server';
import { recordSaleOnChain } from '@/lib/ddt/contract';

/**
 * API Route: Record Sale and Distribute Revenue
 * 
 * When a viewer purchases a film through a distributor's personalized link:
 * 1. Record sale in database with distributor attribution
 * 2. Calculate revenue splits (Filmmaker 70%, Distributor 20%, Goodflix 10%)
 * 3. Update distributor earnings
 * 4. Record on-chain transaction
 * 5. Update film's total sales
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      filmId,
      distributorId,
      holdingId,
      saleAmount,
      buyerEmail,
      paymentMethod,
      paymentId,
      contractAddress,
    } = body;

    console.log('[v0] Recording sale:', {
      filmId,
      distributorId,
      saleAmount,
      buyerEmail,
    });

    if (!filmId || !distributorId || !saleAmount || !contractAddress) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Create sales record in database
    const { data: saleRecord, error: saleError } = await supabase
      .from('sales_records')
      .insert({
        film_id: filmId,
        distributor_id: distributorId,
        ddt_holding_id: holdingId,
        sale_amount: saleAmount,
        buyer_email: buyerEmail,
        payment_method: paymentMethod,
        payment_id: paymentId,
      })
      .select()
      .single();

    if (saleError) {
      console.error('[v0] Error recording sale:', saleError);
      return Response.json(
        { error: 'Failed to record sale' },
        { status: 500 }
      );
    }

    // 2. Calculate revenue splits
    const filemakerShare = (saleAmount * 70) / 100;
    const distributorShare = (saleAmount * 20) / 100;
    const goodflixShare = (saleAmount * 10) / 100;

    // 3. Create revenue payout record
    const { error: payoutError } = await supabase
      .from('revenue_payouts')
      .insert({
        film_id: filmId,
        distributor_id: distributorId,
        sale_id: saleRecord.id,
        filmmaker_share: filemakerShare,
        distributor_share: distributorShare,
        goodflix_share: goodflixShare,
        total_sale_amount: saleAmount,
      });

    if (payoutError) {
      console.error('[v0] Error creating payout record:', payoutError);
    }

    // 4. Update DDT holding with sales attribution
    if (holdingId) {
      const { error: holdingUpdateError } = await supabase
        .from('ddt_holdings')
        .update({
          sales_attributed: supabase.rpc('increment', {
            field: 'sales_attributed',
            value: saleAmount,
          }),
          earned_amount: supabase.rpc('increment', {
            field: 'earned_amount',
            value: distributorShare,
          }),
        })
        .eq('id', holdingId);

      if (holdingUpdateError) {
        console.error('[v0] Error updating holding:', holdingUpdateError);
      }
    }

    // 5. Update film's total sales
    const { error: filmUpdateError } = await supabase
      .from('films')
      .update({
        total_sales_value: supabase.rpc('increment', {
          field: 'total_sales_value',
          value: saleAmount,
        }),
      })
      .eq('id', filmId);

    if (filmUpdateError) {
      console.error('[v0] Error updating film sales:', filmUpdateError);
    }

    // 6. Record on-chain transaction
    try {
      const saleAmountInWei = BigInt(Math.floor(saleAmount * 1e18)).toString();
      const txHash = await recordSaleOnChain(
        contractAddress,
        parseInt(filmId),
        parseInt(distributorId),
        saleAmountInWei
      );

      console.log('[v0] Sale recorded on-chain:', { txHash });

      // Update sale record with transaction hash
      await supabase
        .from('sales_records')
        .update({ transaction_hash: txHash, recorded_on_chain: true })
        .eq('id', saleRecord.id);

      // Record in DDT ledger
      await supabase.from('ddt_ledger').insert({
        operation_type: 'SALE',
        film_id: filmId,
        distributor_id: distributorId,
        notes: `Sale of ${saleAmount} wei attributed to distributor`,
        transaction_hash: txHash,
      });
    } catch (blockchainError) {
      console.error('[v0] Blockchain transaction failed:', blockchainError);
      // Sale is recorded in DB even if blockchain fails; retry logic can handle
    }

    return Response.json(
      {
        success: true,
        message: 'Sale recorded and revenue calculated',
        data: {
          saleId: saleRecord.id,
          filemakerShare,
          distributorShare,
          goodflixShare,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve sales history for a distributor or film
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filmId = searchParams.get('filmId');
    const distributorId = searchParams.get('distributorId');

    const supabase = await createClient();

    let query = supabase.from('sales_records').select('*');

    if (filmId) {
      query = query.eq('film_id', filmId);
    }
    if (distributorId) {
      query = query.eq('distributor_id', distributorId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: 'Failed to fetch sales' }, { status: 500 });
    }

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[v0] API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

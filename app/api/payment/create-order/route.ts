import { createPretiumOrder, calculateStablecoinAmount } from '@/lib/payment/pretium';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const {
      filmId,
      amountKes,
      amountUsd,
      stablecoin,
      paymentMethod,
      referralCode,
    } = await req.json();

    console.log('[v0] Creating payment order:', {
      filmId,
      amountKes,
      stablecoin,
      paymentMethod,
    });

    // Generate a temporary wallet or use existing buyer wallet
    // For now, we'll create an ephemeral wallet for the transaction
    const buyerId = `buyer_${Date.now()}`;
    const buyerWalletAddress = `0x${Math.random().toString(16).slice(2).padStart(40, '0')}`;

    // Create Pretium payment order
    const pretiumOrder = await createPretiumOrder(
      buyerWalletAddress,
      Math.ceil(amountKes),
      stablecoin,
      paymentMethod as any
    );

    console.log('[v0] Pretium order created:', pretiumOrder.order_id);

    // Store transaction record in database
    const supabase = await createClient();
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: buyerId,
        user_type: 'buyer',
        transaction_type: 'purchase',
        amount_kes: Math.ceil(amountKes),
        amount_usd: amountUsd,
        stablecoin_type: stablecoin,
        stablecoin_amount: amountUsd,
        status: 'pending',
        pretium_transaction_id: pretiumOrder.order_id,
        payment_method: paymentMethod,
        film_id: filmId,
        metadata: {
          referralCode,
          paymentUrl: pretiumOrder.payment_url,
        },
      })
      .select()
      .single();

    if (txError) {
      console.error('[v0] Error creating transaction record:', txError);
    }

    return Response.json(
      {
        success: true,
        order_id: pretiumOrder.order_id,
        payment_url: pretiumOrder.payment_url,
        transaction_id: transaction?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating order:', error);
    return Response.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

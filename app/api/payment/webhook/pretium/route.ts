import { verifyPretiumWebhook, handlePretiumWebhook } from '@/lib/payment/pretium';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-pretium-signature');
    const body = await req.text();
    const payload = JSON.parse(body);

    console.log('[v0] Received Pretium webhook:', payload.order_id);

    // Verify webhook signature
    if (!verifyPretiumWebhook(payload, signature || '')) {
      console.warn('[v0] Invalid Pretium webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle webhook
    const result = await handlePretiumWebhook(payload);

    // Update transaction status in database
    if (payload.status === 'completed') {
      const supabase = await createClient();
      
      await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          blockchain_tx_hash: payload.blockchain_tx,
          updated_at: new Date().toISOString(),
        })
        .eq('pretium_transaction_id', payload.order_id);

      console.log('[v0] Payment completed:', payload.order_id);
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[v0] Error handling Pretium webhook:', error);
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

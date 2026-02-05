import { getExchangeRate } from '@/lib/payment/pretium';

export async function GET() {
  try {
    const rate = await getExchangeRate('KES', 'USD');
    
    return Response.json(
      { rate, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Error fetching exchange rate:', error);
    // Return fallback rate
    return Response.json(
      { rate: 0.0077, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  }
}

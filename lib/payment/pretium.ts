/**
 * Pretium.africa Integration
 * Handles fiat-to-stablecoin conversions for Kenyan users
 */

interface PretiumCreateOrderResponse {
  order_id: string;
  payment_url: string;
  amount_kes: number;
  amount_usd: number;
  stablecoin: string;
  wallet_address: string;
  status: string;
}

interface PretiumExchangeRateResponse {
  pair: string;
  rate: number;
  timestamp: string;
}

const PRETIUM_API_URL = 'https://api.pretium.africa/v1';
const PRETIUM_API_KEY = process.env.PRETIUM_API_KEY;

/**
 * Creates a payment order with Pretium
 * User pays in KES, receives stablecoins on Base network
 */
export async function createPretiumOrder(
  walletAddress: string,
  amountKes: number,
  stablecoin: 'USDC' | 'USDT' = 'USDC',
  paymentMethod: 'mpesa' | 'credit_card' = 'mpesa'
): Promise<PretiumCreateOrderResponse> {
  try {
    console.log('[v0] Creating Pretium order:', {
      walletAddress,
      amountKes,
      stablecoin,
      paymentMethod,
    });

    if (!PRETIUM_API_KEY) {
      throw new Error('PRETIUM_API_KEY not configured');
    }

    const response = await fetch(`${PRETIUM_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRETIUM_API_KEY}`,
      },
      body: JSON.stringify({
        amount_kes: amountKes,
        stablecoin: stablecoin,
        wallet_address: walletAddress,
        payment_method: paymentMethod,
        network: 'base', // Base network for stablecoins
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[v0] Pretium API error:', error);
      throw new Error(`Pretium order creation failed: ${error.message}`);
    }

    const data: PretiumCreateOrderResponse = await response.json();
    console.log('[v0] Pretium order created:', data.order_id);
    return data;
  } catch (error) {
    console.error('[v0] Error creating Pretium order:', error);
    throw error;
  }
}

/**
 * Gets current KES to USD exchange rate
 */
export async function getExchangeRate(
  from: string = 'KES',
  to: string = 'USD'
): Promise<number> {
  try {
    if (!PRETIUM_API_KEY) {
      throw new Error('PRETIUM_API_KEY not configured');
    }

    const response = await fetch(
      `${PRETIUM_API_URL}/exchange-rates?from=${from}&to=${to}`,
      {
        headers: {
          Authorization: `Bearer ${PRETIUM_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data: PretiumExchangeRateResponse = await response.json();
    console.log('[v0] Exchange rate:', { pair: data.pair, rate: data.rate });
    return data.rate;
  } catch (error) {
    console.error('[v0] Error fetching exchange rate:', error);
    // Fallback to approximate rate if API fails
    return 0.0077; // Approximate KES to USD
  }
}

/**
 * Calculates stablecoin amount from KES
 */
export async function calculateStablecoinAmount(
  amountKes: number
): Promise<number> {
  try {
    const rate = await getExchangeRate('KES', 'USD');
    const amountUsd = amountKes * rate;
    return amountUsd; // 1 USDC/USDT = 1 USD
  } catch (error) {
    console.error('[v0] Error calculating stablecoin amount:', error);
    throw error;
  }
}

/**
 * Verifies a Pretium payment webhook
 */
export function verifyPretiumWebhook(
  payload: any,
  signature: string
): boolean {
  try {
    // Verify signature using PRETIUM_WEBHOOK_SECRET
    const secret = process.env.PRETIUM_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('PRETIUM_WEBHOOK_SECRET not configured');
    }

    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('[v0] Error verifying Pretium webhook:', error);
    return false;
  }
}

/**
 * Handles Pretium webhook callback when payment is received
 */
export async function handlePretiumWebhook(payload: any) {
  try {
    console.log('[v0] Processing Pretium webhook:', payload.order_id);

    const { order_id, status, stablecoin_amount, wallet_address } = payload;

    if (status === 'completed') {
      console.log('[v0] Payment completed:', {
        orderId: order_id,
        amount: stablecoin_amount,
      });
      // Update wallet balance
      // Trigger smart contract transfer
      return { success: true, status: 'completed' };
    } else if (status === 'failed') {
      console.error('[v0] Payment failed:', order_id);
      return { success: false, status: 'failed' };
    }

    return { success: true, status };
  } catch (error) {
    console.error('[v0] Error handling Pretium webhook:', error);
    throw error;
  }
}

/**
 * Lists available payment methods for Kenyan users
 */
export function getKenyanPaymentMethods() {
  return [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay via M-Pesa',
      icon: '📱',
      min: 100,
      max: 500000,
      fees: '0%',
    },
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard',
      icon: '💳',
      min: 100,
      max: 500000,
      fees: '2.9% + KES 50',
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: '🏦',
      min: 1000,
      max: 5000000,
      fees: '0.5%',
    },
  ];
}

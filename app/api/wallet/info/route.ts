import { createClient } from '@/lib/supabase/server';
import { getWalletForUser } from '@/lib/wallet/create-wallet';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get wallet for user
    const wallet = await getWalletForUser(user.id);
    
    if (!wallet) {
      return Response.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    return Response.json(wallet, { status: 200 });
  } catch (error) {
    console.error('[v0] Error fetching wallet info:', error);
    return Response.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

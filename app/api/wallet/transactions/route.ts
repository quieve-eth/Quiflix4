import { createClient } from '@/lib/supabase/server';

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

    // Get transactions for user
    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[v0] Error fetching transactions:', error);
      return Response.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    return Response.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error('[v0] Error in transactions API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

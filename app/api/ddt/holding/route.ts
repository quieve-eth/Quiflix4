import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get('distributorId');
    const filmId = searchParams.get('filmId');

    if (!distributorId || !filmId) {
      return Response.json(
        { error: 'Missing distributorId or filmId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ddt_holdings')
      .select('*')
      .eq('distributor_id', distributorId)
      .eq('film_id', filmId)
      .single();

    if (error || !data) {
      // Return empty holding if not found (distributor may not have DDT for this film yet)
      return Response.json(
        {
          data: {
            id: null,
            personalized_link: null,
            sales_attributed: 0,
            earned_amount: 0,
            ddt_balance: 0,
          },
        },
        { status: 200 }
      );
    }

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[v0] Error fetching DDT holding:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

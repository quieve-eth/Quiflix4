import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('films')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return Response.json(
        { error: 'Film not found' },
        { status: 404 }
      );
    }

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[v0] Error fetching film:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

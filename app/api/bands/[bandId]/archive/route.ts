import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { bandId: string } }
) {
  const bandId = parseInt(params.bandId, 10);
  if (!bandId) {
    return NextResponse.json({ error: 'Invalid band ID' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: band, error: fetchError } = await supabase
    .from('bands')
    .select('archived_at')
    .eq('id', bandId)
    .maybeSingle();

  if (fetchError || !band) {
    return NextResponse.json({ error: 'Band not found' }, { status: 404 });
  }

  const archived_at = band.archived_at ? null : new Date().toISOString();

  const { error: updateError } = await supabase
    .from('bands')
    .update({ archived_at })
    .eq('id', bandId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ archived_at });
}

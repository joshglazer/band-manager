import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { bandId: string } }
) {
  const bandId = parseInt(params.bandId, 10);
  const { name, proposals_per_member, songs_to_add } = await request.json();

  if (!name || !bandId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('vote_sessions')
    .insert({
      band_id: bandId,
      name,
      proposals_per_member: proposals_per_member ?? 3,
      songs_to_add: songs_to_add ?? 3,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

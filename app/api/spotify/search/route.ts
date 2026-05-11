import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query?.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_API_KEY;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Spotify not configured' }, { status: 503 });
  }

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenResponse.ok) {
    return NextResponse.json({ error: 'Failed to authenticate with Spotify' }, { status: 502 });
  }

  const { access_token } = await tokenResponse.json();

  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  if (!searchResponse.ok) {
    return NextResponse.json({ error: 'Spotify search failed' }, { status: 502 });
  }

  const data = await searchResponse.json();
  return NextResponse.json(data.tracks.items);
}

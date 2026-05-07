# Band Manager

A web app for bands to manage their songs, setlists, events, and members — all in one place.

## Features

- **Bands** — Create and manage multiple bands, invite members by email, and control membership
- **Songs** — Maintain a song library per band, with chord charts and Spotify import support
- **Setlists** — Build setlists organized into sets, drag-and-drop ordering, and printable chord chart views
- **Events** — Schedule rehearsals and gigs with a shared band calendar
- **Practice tracking** — Log practice progress per song
- **Members** — View band roster with instruments and profiles
- **Settings** — Rename or archive a band

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) — auth, database, and row-level security
- [Tailwind CSS](https://tailwindcss.com)

## Getting Started

1. Create a [Supabase project](https://database.new)

2. Clone the repo and install dependencies:

   ```bash
   git clone <repo-url>
   cd band-manager
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

   Both values are in your [Supabase project API settings](https://app.supabase.com/project/_/settings/api).

4. Apply the database migrations:

   ```bash
   npx supabase db push
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

   The app runs at [localhost:3000](http://localhost:3000).

## Optional: Spotify Integration

To enable Spotify song import, add the following to `.env.local`:

```
SPOTIFY_CLIENT_ID=<your-spotify-client-id>
SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
```

ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS audio_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('song-audio', 'song-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Band members can upload song audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'song-audio' AND
  is_band_member((split_part(name, '/', 1))::integer)
);

CREATE POLICY "Band members can update song audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'song-audio' AND
  is_band_member((split_part(name, '/', 1))::integer)
)
WITH CHECK (
  bucket_id = 'song-audio' AND
  is_band_member((split_part(name, '/', 1))::integer)
);

CREATE POLICY "Band members can delete song audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'song-audio' AND
  is_band_member((split_part(name, '/', 1))::integer)
);

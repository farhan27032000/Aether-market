-- Migration: let logged-in users delete their own listings and listing photos ("My Listings").
-- Run once in the Supabase SQL editor after auth.sql.

drop policy if exists "Authenticated users delete own listings" on public.listings;
create policy "Authenticated users delete own listings" on public.listings
  for delete to authenticated using (auth.uid() = user_id);

-- Photos live under `<user_id>/`, so users can only remove files in their own folder.
drop policy if exists "Authenticated delete own listing images" on storage.objects;
create policy "Authenticated delete own listing images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

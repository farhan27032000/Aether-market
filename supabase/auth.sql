-- Migration: require Supabase Auth to publish listings.
-- Run once in the Supabase SQL editor on an existing project created from listings.sql.

alter table public.listings
  add column if not exists user_id uuid references auth.users (id) on delete set null default auth.uid();

create index if not exists listings_user_id_idx on public.listings (user_id);

-- Only logged-in users can insert, and only rows owned by themselves.
drop policy if exists "Public insert listings" on public.listings;
drop policy if exists "Authenticated users insert own listings" on public.listings;
create policy "Authenticated users insert own listings" on public.listings
  for insert to authenticated with check (auth.uid() = user_id);

-- Photo uploads: logged-in users may only write inside their own `<user_id>/` folder.
drop policy if exists "Public upload listing images" on storage.objects;
drop policy if exists "Authenticated upload own listing images" on storage.objects;
create policy "Authenticated upload own listing images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

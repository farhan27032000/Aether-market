-- Schema of the `listings` table used by app/page.tsx (matches the live Supabase project).
-- Run in the Supabase SQL editor to recreate it.

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_usd numeric,
  country text,      -- ISO 3166-1 alpha-2 code, e.g. 'US', 'AE'
  city text,
  category text,     -- 'real-estate' | 'vehicles' | 'electronics' | 'industrial' | 'services'
  image_url text,
  user_id uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

-- Anyone can browse listings.
create policy "Public read listings" on public.listings
  for select using (true);

-- Only logged-in users can publish, and only as themselves.
create policy "Authenticated users insert own listings" on public.listings
  for insert to authenticated with check (auth.uid() = user_id);

-- Optional: public bucket for original photos uploaded via Publish Direct.
-- Without it, listings are still saved and shown with a placeholder image.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Authenticated upload own listing images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

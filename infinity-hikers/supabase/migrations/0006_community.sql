-- The Community page's gallery photos and trip reports were 100% hardcoded
-- fabricated content — stock photos, invented author names, invented
-- like-counts, invented blog posts — with no admin wiring at all, unlike
-- every other content type on the site. See MOCK_DATA_AUDIT.md. This gives
-- the admin a real, editable home for this content, seeded from the exact
-- content already live today so nothing changes visually until an admin
-- edits it.
--
-- HOW TO RUN THIS:
--   Supabase Dashboard -> your project -> SQL Editor -> New query -> paste
--   this whole file -> Run. Safe to run once on a fresh project.

create table if not exists community_photos (
  id text primary key,
  src text not null,
  destination text,
  author text,
  caption text,
  likes integer not null default 0,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists community_posts (
  id text primary key,
  title text not null,
  author text,
  avatar text,
  date_label text,
  destination text,
  excerpt text,
  read_time text,
  likes integer not null default 0,
  image text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table community_photos enable row level security;
alter table community_posts enable row level security;

create policy "community_photos public read" on community_photos for select using (true);
create policy "community_photos authenticated write" on community_photos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "community_posts public read" on community_posts for select using (true);
create policy "community_posts authenticated write" on community_posts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into community_photos (id, src, destination, author, caption, likes, featured, sort_order) values
  ('p1', 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800', 'Sri Lanka', 'Priya M.', 'Bentota Beach at sunset — magical!', 124, true, 0),
  ('p2', 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800', 'Sri Lanka', 'Rahul K.', 'Madu River safari was worth every moment', 89, false, 1),
  ('p3', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'Bali', 'Arjun D.', 'Tegallalang rice terraces', 201, true, 2),
  ('p4', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800', 'Bali', 'Ananya R.', 'Temple ceremony at Tanah Lot', 98, false, 3),
  ('p5', 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800', 'Sri Lanka', 'Varun G.', 'Colombo after dark', 178, false, 4),
  ('p6', 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800', 'Sri Lanka', 'Diya N.', 'Kandy temple visit in the morning', 112, false, 5),
  ('p7', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800', 'Bali', 'Riya L.', 'Sunrise at Mount Batur', 230, true, 6)
on conflict (id) do nothing;

insert into community_posts (id, title, author, avatar, date_label, destination, excerpt, read_time, likes, image, sort_order) values
  ('r1', '6 Days in Sri Lanka: A Group Traveler''s Dream', 'Priya Menon', 'https://i.pravatar.cc/80?img=25', 'Feb 2026', 'Sri Lanka', 'I was nervous about my first group trip, but the Infinity Pravasa team made it unforgettable. From Bentota Beach to the scenic coastal train journey, every moment was curated to perfection.', '5 min read', 47, 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=900', 0),
  ('r2', 'Sri Lanka: Beaches, Tea Country & Culture', 'Rahul Krishnamurthy', 'https://i.pravatar.cc/80?img=12', 'Apr 2025', 'Sri Lanka', 'From the Madu River safari to the Temple of the Tooth and tea-covered hills of Nuwara Eliya, every day felt like a new discovery. Sri Lanka is a destination full of warmth and wonder.', '8 min read', 82, 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=900', 1),
  ('r3', 'Bali: Beyond the Instagram Clichés', 'Arjun Deshmukh', 'https://i.pravatar.cc/80?img=18', 'Dec 2025', 'Bali', 'Yes, the rice terraces are stunning. But the real Bali magic? It''s in the temple ceremonies at dawn, the conversations with local artisans, and the sunrises from Mount Batur that make you question why you ever hit snooze.', '7 min read', 104, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900', 2)
on conflict (id) do nothing;

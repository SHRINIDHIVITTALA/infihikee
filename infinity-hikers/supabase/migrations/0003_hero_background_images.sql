-- Lets each homepage banner slide have its own set of background photos for
-- the drifting/masonry photo wall, instead of always borrowing whatever
-- photos happen to be in the linked tour's gallery.
--
-- HOW TO RUN THIS:
--   Supabase Dashboard -> your project -> SQL Editor -> New query -> paste
--   this whole file -> Run. Safe to run once: it only adds one new column
--   with a default, so existing rows keep working unchanged (they'll keep
--   falling back to the linked tour's gallery until an admin sets photos
--   here explicitly).

alter table hero_slides
  add column if not exists background_images jsonb default '[]'::jsonb;

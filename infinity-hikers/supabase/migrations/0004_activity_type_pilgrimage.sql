-- Renames the "Cultural" Activity Type to "Pilgrimage" everywhere. The admin
-- dropdown and code defaults were updated in the same change; this brings
-- already-saved tours in line so the trip-page badge (which just prints the
-- raw activity_type value) reads "pilgrimage" instead of "cultural".
--
-- HOW TO RUN THIS:
--   Supabase Dashboard -> your project -> SQL Editor -> New query -> paste
--   this whole file -> Run. Safe to run once (and safe to re-run — a no-op
--   the second time since no row will still say 'cultural').

update tours set activity_type = 'pilgrimage' where activity_type = 'cultural';

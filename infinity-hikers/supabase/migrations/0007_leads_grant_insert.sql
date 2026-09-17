-- 0005_leads.sql's RLS policy ("leads public insert" ... with check (true))
-- only RESTRICTS an insert that's already allowed — it can't grant a
-- privilege the anon role doesn't have in the first place. Verified live:
-- an anon-key insert against the freshly-created leads table failed with
-- "new row violates row-level security policy" (Postgres error 42501,
-- which covers both RLS failures and missing base GRANTs) even though the
-- policy itself is permissive — meaning this project's anon role never had
-- a base INSERT grant on this brand-new table. This is the first table in
-- the project that needs anon to write at all (every other table only
-- grants authenticated write), so it's the first time this gap surfaced.
--
-- HOW TO RUN THIS:
--   Supabase Dashboard -> your project -> SQL Editor -> New query -> paste
--   this whole file -> Run.

grant insert on leads to anon;
grant select, delete on leads to authenticated;

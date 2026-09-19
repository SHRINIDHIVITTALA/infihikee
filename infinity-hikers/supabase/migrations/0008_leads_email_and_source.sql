-- Adds an email field and a "source" tag to leads, for the new lead-capture
-- entry points beyond the original phone-only "Get a Callback" form: the
-- exit-intent popup and the itinerary-download gate. `source` lets the admin
-- tell these apart in the Enquiries tab (e.g. "callback", "exit_intent",
-- "itinerary_download"). Both nullable so existing rows and the old form
-- (which never collected email) keep working unchanged.
--
-- HOW TO RUN THIS:
--   Supabase Dashboard -> your project -> SQL Editor -> New query -> paste
--   this whole file -> Run. Safe to run once.

alter table leads add column if not exists email text;
alter table leads add column if not exists source text;

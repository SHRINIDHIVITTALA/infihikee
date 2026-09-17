-- The "Get a Callback" form was only ever writing to the visitor's own
-- browser localStorage — the business never actually received these
-- requests unless the admin happened to open the site in that exact same
-- browser profile. See MOCK_DATA_AUDIT.md. This gives leads a real,
-- shared home so any admin can see every request from any device.
--
-- HOW TO RUN THIS:
--   Supabase Dashboard -> your project -> SQL Editor -> New query -> paste
--   this whole file -> Run. Safe to run once on a fresh project.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  trip text,
  message text,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

-- Anyone (including anonymous visitors) can submit a callback request, but
-- only a signed-in admin can read or delete them — same pattern as the
-- tour_images storage bucket and every other admin-only table.
create policy "leads public insert" on leads for insert with check (true);
create policy "leads authenticated read" on leads for select
  using (auth.role() = 'authenticated');
create policy "leads authenticated delete" on leads for delete
  using (auth.role() = 'authenticated');

-- Infinity Pravasa: move the remaining admin-editable content out of
-- localStorage and into Supabase — Reviews, Settings, Website Pages,
-- Trip Types & Regions, and Menus & Links. Same reasoning as
-- 0001_tours_and_hero_slides.sql: content saved in the admin panel needs to
-- reach every visitor, not just the browser that saved it.
--
-- HOW TO RUN THIS: Supabase Dashboard -> your project -> SQL Editor ->
-- New query -> paste this whole file -> Run. Additive only — creates two new
-- tables, does not touch tours, hero_slides, or anything else already there.
--
-- After running this, deploy the matching code change. Until both are done,
-- the site keeps working exactly as it does now (reading from localStorage).

create table if not exists testimonials (
  id text primary key,
  name text not null,
  avatar text,
  rating numeric,
  destination text,
  text text,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;
create policy "testimonials public read" on testimonials for select using (true);
create policy "testimonials authenticated write" on testimonials for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into testimonials (id, name, avatar, rating, destination, text) values
  (
    't1', 'Priya Sharma', 'https://i.pravatar.cc/80?img=32', 5, 'Sri Lanka', 'Every detail was planned perfectly. Bentota Beach and the coastal train journey were unforgettable. Already planning my next trip!'
  ),
  (
    't2', 'Ankit Verma', 'https://i.pravatar.cc/80?img=15', 5, 'Sri Lanka', 'Sri Lanka was a perfect mix of beaches, wildlife, tea country and culture. Infinity Pravasa made every day effortless. Worth every rupee.'
  ),
  (
    't4', 'Neha Gupta', 'https://i.pravatar.cc/80?img=47', 5, 'Bali', 'Perfect honeymoon trip! The Balinese spa and Uluwatu sunset cliff were moments straight out of a dream.'
  ),
  (
    't6', 'Arun Krishnan', 'https://i.pravatar.cc/80?img=59', 5, 'Bali', 'Bali exceeded every expectation. The sunrise trek to Mount Batur was the single best moment of my entire year.'
  )
on conflict (id) do nothing;

-- Everything else here is one admin-wide config object per site, not a list
-- of independent records — a single row with one jsonb column per content
-- type is simpler than five near-empty tables and maps directly onto the
-- five remaining contexts (Settings, SitePages, PricingRules, Catalog, NavLinks).
create table if not exists site_config (
  id integer primary key default 1,
  settings jsonb not null default '{}'::jsonb,
  pages jsonb not null default '{}'::jsonb,
  pricing_rules jsonb not null default '{}'::jsonb,
  category_options jsonb not null default '[]'::jsonb,
  scope_options jsonb not null default '[]'::jsonb,
  nav_links jsonb not null default '[]'::jsonb,
  footer_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_config_singleton check (id = 1)
);

alter table site_config enable row level security;
create policy "site_config public read" on site_config for select using (true);
create policy "site_config authenticated write" on site_config for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into site_config (
  id, settings, pages, pricing_rules, category_options, scope_options, nav_links, footer_links
) values (
  1,
'{"whatsapp":"919916258596","phone":"+91 99162 58596","email":"infinityhikers@gmail.com","instagram":"https://www.instagram.com/infinity.hikers","businessName":"Infinity Pravasa","tagline":"482+ adventurers. Zero regrets.","footerDescription":"Premium adventures at accessible prices — safely curated by local experts so you can focus on the joy of discovery.","footerNote":"Made with ♥ for adventure lovers","currency":"INR"}'::jsonb,
    '{"about":{"heading":"About Infinity Pravasa","body":"Infinity Pravasa is a group travel company built for people who want to explore the world without the stress of planning it themselves. We handle the flights, hotels, transport and local guides — you just show up and enjoy the trip.\n\nEvery itinerary is put together by people who have actually been there, and every group is looked after by a tour captain from start to finish."},"terms":{"heading":"Terms & Conditions","body":"By booking a trip with Infinity Pravasa, you agree to the price, dates, inclusions and cancellation rules shown on that trip''s page at the time of booking.\n\nPrices are per person and subject to change until a booking is confirmed with payment. Travellers are responsible for having a valid passport, any required visas, and personal travel insurance unless stated otherwise on the trip page."},"privacy":{"heading":"Privacy Policy","body":"We collect the contact details you share with us (like your name, phone number and email) only to respond to booking enquiries and share trip information.\n\nWe do not sell your information to third parties. Your details are used solely by the Infinity Pravasa team to plan and communicate about your trip."},"treksIntro":{"eyebrow":"Trails & Peaks","title":"TREKS","subtitle":"Lace up for Karnataka''s best trekking trails and beyond"},"pilgrimagesIntro":{"eyebrow":"Sacred Journeys","title":"PILGRIMAGES","subtitle":"Temple trails and sacred sites, planned end to end"},"faqs":[{"question":"How do I book a trip?","answer":"Message us on WhatsApp with the trip you''re interested in and we''ll guide you through the next steps."},{"question":"How do payments work?","answer":"Most trips need a booking amount to hold your seat, with the balance due before travel — check the Payment section on each trip page for exact amounts."},{"question":"Can I cancel or get a refund?","answer":"Each trip page lists its own cancellation and refund rules under ''Cancellation & Refund Rules''."}],"sustainability":{"badge":"🌍 Eco-Conscious Travel","heading":"Travel Responsibly","subheading":"We believe in leaving destinations better than we found them","offsetNote":"We contribute 2% of every booking to verified carbon offset projects. You can opt to offset the full amount during booking.","tips":[{"icon":"🚰","title":"Carry Reusable Bottles","desc":"Skip single-use plastic. We provide filtered water refill stations at hotels."},{"icon":"🧴","title":"Eco-Friendly Toiletries","desc":"Bring biodegradable sunscreen and shampoo bars to protect marine life."},{"icon":"🛍️","title":"Say No to Plastic Bags","desc":"Carry a reusable tote for shopping and souvenirs."},{"icon":"🚶","title":"Walk & Cycle","desc":"Explore neighborhoods on foot — it''s the best way to discover hidden gems."},{"icon":"🍽️","title":"Eat Local","desc":"Support local restaurants and street vendors instead of international chains."},{"icon":"🏨","title":"Conserve Hotel Resources","desc":"Reuse towels, turn off AC when leaving, and take shorter showers."},{"icon":"📸","title":"Leave No Trace","desc":"Take only photos, leave only footprints. Don''t disturb wildlife or coral."},{"icon":"💰","title":"Buy Fair Trade","desc":"Purchase souvenirs directly from artisans to ensure fair wages."}],"partners":[{"icon":"🌿","name":"Sri Lanka Sustainable Tourism","focus":"Responsible travel and community tourism across Sri Lanka"},{"icon":"🐢","name":"Bali Sea Turtle Society","focus":"Marine conservation & turtle rehabilitation"},{"icon":"🐢","name":"Sri Lanka Marine Conservation","focus":"Coastal and sea turtle conservation"}],"commitments":[{"icon":"🏨","title":"Eco-Certified Hotels","desc":"All partner hotels meet green certification standards"},{"icon":"🚌","title":"Shared Transport","desc":"Group travel reduces per-person carbon footprint by 60%"},{"icon":"🍃","title":"2% Green Fund","desc":"Every booking contributes to our environmental offset fund"},{"icon":"📋","title":"No-Plastic Policy","desc":"Zero single-use plastics on all Infinity Pravasa trips"}]}}'::jsonb,
    '{"accommodationTiers":[{"value":"standard","label":"Standard (3-Star)","icon":"🏨","multiplier":0.85},{"value":"comfort","label":"Comfort (4-Star)","icon":"🏩","multiplier":1},{"value":"premium","label":"Premium (5-Star)","icon":"🏰","multiplier":1.4}],"activityAddOns":[{"key":"adventure","label":"Adventure Activities","icon":"🧗","cost":3999},{"key":"wellness","label":"Spa & Wellness","icon":"🧖","cost":2999},{"key":"foodie","label":"Local Food Tours","icon":"🍜","cost":1999},{"key":"photography","label":"Pro Photography","icon":"📸","cost":4999}],"extraAddOns":[{"key":"insurance","label":"🛡️ Travel Insurance","cost":2999},{"key":"airportTransfer","label":"🚗 Airport Transfer","cost":3499},{"key":"privateRoom","label":"🛏️ Private Room Upgrade","cost":8999}],"groupDiscountTiers":[{"minTravelers":10,"discountPercent":10},{"minTravelers":5,"discountPercent":5},{"minTravelers":3,"discountPercent":2}]}'::jsonb,
    '[{"value":"tour","label":"Tour"},{"value":"trek","label":"Trek"},{"value":"pilgrimage","label":"Pilgrimage"},{"value":"activity","label":"Activity"}]'::jsonb,
    '[{"value":"international","label":"International"},{"value":"national","label":"National"},{"value":"karnataka","label":"Karnataka"}]'::jsonb,
    '[{"to":"/","label":"Home"},{"to":"/destinations","label":"Destinations"},{"to":"/treks","label":"Treks"},{"to":"/pilgrimages","label":"Pilgrimages"},{"to":"/trip-planner","label":"Planner"}]'::jsonb,
    '[{"to":"/","label":"Home"},{"to":"/destinations","label":"Destinations"},{"to":"/treks","label":"Treks"},{"to":"/pilgrimages","label":"Pilgrimages"},{"to":"/trip-planner","label":"Trip Planner"},{"to":"/map","label":"Explore Map"},{"to":"/community","label":"Community"}]'::jsonb
) on conflict (id) do nothing;

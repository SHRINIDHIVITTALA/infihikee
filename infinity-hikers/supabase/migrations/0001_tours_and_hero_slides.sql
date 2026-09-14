-- Infinity Pravasa: move Tours and Homepage Banner pictures out of admin
-- browser localStorage and into Supabase, so content added in the admin
-- panel actually reaches real visitors (and survives a refresh/new device).
--
-- HOW TO RUN THIS:
--   Supabase Dashboard -> your project -> SQL Editor -> New query -> paste
--   this whole file -> Run. Safe to run once on a fresh project: it only
--   creates two new tables and seeds them from what's live today. It does
--   not touch any existing table, bucket, or auth user.
--
-- After running this, deploy the matching code change (ItineraryContext.jsx
-- and HeroContext.jsx now read/write these tables instead of localStorage).
-- Until you run this AND deploy that code, nothing changes — the site keeps
-- working exactly as it does now.

create table if not exists tours (
  id text primary key,
  destination text not null,
  country text,
  category text not null default 'tour',
  scope text not null default 'international',
  dates text,
  start_date date,
  end_date date,
  duration text,
  duration_days integer,
  price numeric,
  currency text default 'INR',
  difficulty text,
  rating numeric default 0,
  review_count integer default 0,
  activity_type text,
  best_season text,
  seats_left integer default 0,
  description text,
  highlights jsonb default '[]'::jsonb,
  itinerary jsonb default '[]'::jsonb,
  includes jsonb default '[]'::jsonb,
  excludes jsonb default '[]'::jsonb,
  payment_plan jsonb default '[]'::jsonb,
  deposit_note text,
  cancellation_policy text,
  group_size text,
  meeting_point text,
  visa_note text,
  insurance_note text,
  packing_extras jsonb default '[]'::jsonb,
  flight_distance_km numeric,
  co2_per_person_tonnes numeric,
  coordinates jsonb,
  image text,
  gallery jsonb default '[]'::jsonb,
  testimonials jsonb default '[]'::jsonb,
  eco_badges jsonb default '[]'::jsonb,
  eco_friendly boolean default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists hero_slides (
  id text primary key,
  dest text,
  country text,
  tagline text,
  date_start date,
  date_end date,
  dates text,
  image text,
  tour_id text references tours(id) on delete set null,
  status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table tours enable row level security;
alter table hero_slides enable row level security;

-- Public site reads without logging in; only a signed-in admin can write.
-- Same pattern already used for the tour_images storage bucket.
create policy "tours public read" on tours for select using (true);
create policy "tours authenticated write" on tours for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "hero_slides public read" on hero_slides for select using (true);
create policy "hero_slides authenticated write" on hero_slides for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed from what's live today (src/data/itineraries.js + HeroContext.jsx's
-- defaults), so the site has the same content the moment this table takes
-- over — nothing to re-enter by hand for what already exists.
insert into tours (
  id, destination, country,
  category, scope,
  dates, start_date, end_date,
  duration, duration_days, price, currency,
  difficulty, rating, review_count,
  activity_type, best_season, seats_left,
  description,
  highlights, itinerary, includes, excludes,
  payment_plan, deposit_note, cancellation_policy,
  group_size, meeting_point, visa_note, insurance_note,
  packing_extras, flight_distance_km, co2_per_person_tonnes,
  coordinates, image, gallery, testimonials,
  eco_badges, eco_friendly, status
) values
  (
    'sri-lanka-aug-2026', 'Sri Lanka Group Tour 2026', 'Sri Lanka',
    'tour', 'international',
    'August 6 - 11, 2026', '2026-08-06', '2026-08-11',
    '6 Days / 5 Nights', 6, 70000, 'INR',
    'Easy', 4.9, 0,
    'cultural', 'Aug', 0,
    'Discover the Pearl of the Indian Ocean with Infinity Pravasa. This Sri Lanka group tour is a perfect blend of beaches, culture, wildlife, nature and adventure.',
    '["Bentota Beach","Madu River Boat Safari","Turtle Hatchery","Scenic Coastal Train Journey","Galle Dutch Fort","Pinnawala Elephant Orphanage","Kandy Temple of the Tooth","Tea Plantation & Factory Visit","Ramboda Waterfalls","Nuwara Eliya","Colombo City Tour & Shopping"]'::jsonb, '[{"day":1,"title":"Arrival in Sri Lanka","description":"Arrive in Sri Lanka and begin your group adventure with Infinity Pravasa."},{"day":2,"title":"Bentota Beach, Madu River & Galle","description":"Enjoy Bentota Beach, a Madu River boat safari, Turtle Hatchery visit and the historic Galle Dutch Fort."},{"day":3,"title":"Coastal Train Journey & Pinnawala","description":"Take the scenic coastal train journey and visit the Pinnawala Elephant Orphanage."},{"day":4,"title":"Kandy & Temple of the Tooth","description":"Explore Kandy and visit the sacred Temple of the Tooth."},{"day":5,"title":"Nuwara Eliya & Tea Country","description":"Travel through tea country to Nuwara Eliya, including a tea plantation and factory visit plus Ramboda Waterfalls."},{"day":6,"title":"Colombo City Tour & Departure","description":"Discover Colombo on a city tour with time for shopping before departure."}]'::jsonb, '["Flight Included","Premium Hotel Stay","Daily Breakfast & Dinner","Comfortable AC Transportation","English Speaking Guide","Sightseeing as per itinerary"]'::jsonb, 'null'::jsonb,
    'null'::jsonb, NULL, NULL,
    NULL, NULL, NULL, NULL,
    '["Universal travel adapter","Light, modest clothing for temples","Rain jacket or compact umbrella","Cash LKR or multi-currency forex card","Sunscreen SPF 50+","Comfortable footwear for city and nature walks"]'::jsonb, 1400, 0.28,
    '{"lat":7.8731,"lng":80.7718}'::jsonb, 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=1200&q=80', '["https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800&q=80","https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&q=80"]'::jsonb, '[]'::jsonb,
    '["Community Tourism","Responsible Tourism"]'::jsonb, true, 'active'
  ),
  (
    'bali-may-2026', 'Bali Premium Holiday', 'Indonesia',
    'tour', 'international',
    'May 19 - 26, 2026', '2026-05-19', '2026-05-26',
    '8 Days / 7 Nights', 8, 90000, 'INR',
    'Easy', 5, 203,
    'premium', 'Apr - Oct', 4,
    'Escape to the Island of the Gods with our all-inclusive Bali Premium Holiday. Enjoy 4★ hotel stays, expert-guided tours, and exquisite Indian meals. Flight Details: BLR ➝ DPS (19 May, 01:00 – 10:20) | DPS ➝ BLR (26 May, 11:20 – 15:10). Payment Plan: ₹30,000 (Booking), ₹40,000 (45 days prior), ₹35,000 (25 days prior).',
    '["Garuda Wisnu Kencana","Uluwatu Temple & Kecak Dance","Tanah Lot & Ulun Danu Temple","Waterfalls, Bali Swing & Rice Terraces","Lempuyang Heaven''s Gate","Nusa Penida Island Tour","Leisure day for shopping & spa"]'::jsonb, '[{"day":1,"title":"Arrive Bali — Welcome to the Island of Gods","description":"Land at Ngurah Rai International Airport (BLR → DPS, departs 01:00, arrives 10:20). Check in to your premium 4-star resort. Afternoon to freshen up. Evening orientation walk and lavish welcome dinner with Indian cuisine."},{"day":2,"title":"GWK Cultural Park & Uluwatu Sunset","description":"Morning visit to the colossal Garuda Wisnu Kencana Cultural Park, home to a 120m bronze Vishnu statue — one of the tallest statues in the world. Afternoon drive to Uluwatu — a dramatic clifftop Hindu temple 70m above the crashing Indian Ocean. Watch the hypnotic Kecak Fire Dance at sunset."},{"day":3,"title":"Tanah Lot & Ulun Danu Highland Temple","description":"Photograph Tanah Lot at high tide — Bali''s most photographed sea temple sitting on a rocky islet. Drive north to Bedugul highlands and visit the fairytale Ulun Danu Beratan temple, seemingly floating on a misty crater lake surrounded by mountains."},{"day":4,"title":"Waterfalls, Bali Swing & Tegallalang","description":"Chase the emerald Tegenungan and mystical Tukad Cepung waterfalls (hidden inside a canyon). Soar above the jungle on the famous Bali Swing for that perfect shot. Walk through Tegallalang''s UNESCO-listed emerald rice terraces. Lunch at a cliff-edge café."},{"day":5,"title":"Lempuyang — Heaven''s Gate ⭐","description":"Rise before dawn for the iconic Heaven''s Gate photo at Pura Lempuyang Luhur, with sacred Mount Agung reflected in the mirror pool below the split gate. One of Bali''s most powerful spiritual sites and the most photographed moment of the trip."},{"day":6,"title":"Nusa Penida Island Tour","description":"Fast boat to Nusa Penida (30 min). Visit Kelingking Beach — the ''T-Rex cliff'' with its dinosaur-shaped headland and turquoise cove below. Angel''s Billabong (natural rock infinity pool), Broken Beach''s dramatic arch, and Crystal Bay''s pristine snorkelling. Includes fast boat and guided tour."},{"day":7,"title":"Leisure Day — Shopping, Spa & Ubud","description":"A full free day to explore at your own pace. Browse Ubud Art Market for batik, silver jewellery, and carved wood. Wander the Ubud Monkey Forest. Treat yourself to a traditional Balinese massage (jamu herbal oil, $15/hr at local spas). Perfect day to recharge before departure."},{"day":8,"title":"Departure — Until We Meet Again, Bali","description":"Check out and transfer to Ngurah Rai Airport for DPS → BLR flight (departs 11:20, arrives 15:10). Fly home with a tan, a full memory card, and an empty suitcase (filled on the way back with Bali treasures)."}]'::jsonb, '["Return Flights (Ex-Bengaluru)","Bali Visa","7 Nights 4★ Hotel Stay","Private AC Transportation","Sightseeing & Entry Tickets","Nusa Penida Fast Boat + Lunch","Daily Breakfast & Indian Meals","Professional Tour Captain"]'::jsonb, 'null'::jsonb,
    '[{"label":"On Booking","amount":30000,"when":"Today"},{"label":"2nd Payment","amount":40000,"when":"45 days before"},{"label":"Final Payment","amount":35000,"when":"25 days before"}]'::jsonb, NULL, NULL,
    NULL, NULL, NULL, NULL,
    '["Sarong — mandatory for temple entry","Reef-safe sunscreen (protects coral reefs)","Swimwear × 2","Cash IDR — card acceptance is limited outside resorts","Mosquito repellent (tropical evenings)","Comfortable sandals for temple walks","Rain jacket (tropical afternoon showers)"]'::jsonb, 5780, 0.92,
    '{"lat":-8.3405,"lng":115.092}'::jsonb, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80', '["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80","https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80","https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80"]'::jsonb, '[{"name":"Arun Krishnan","avatar":"https://i.pravatar.cc/80?img=59","rating":5,"text":"Bali exceeded all expectations. The Nusa Penida trip was the highlight of my year!"},{"name":"Neha Gupta","avatar":"https://i.pravatar.cc/80?img=47","rating":5,"text":"Perfect premium trip! The 4-star hotels and Uluwatu sunset were unforgettable moments."}]'::jsonb,
    '["Carbon Offset","Plastic-Free","Community Tourism"]'::jsonb, true, 'active'
  ),
  (
    'kumara-parvatha-trek', 'Kumara Parvatha Trek', 'India',
    'trek', 'karnataka',
    'September 5 - 6, 2026', '2026-09-05', '2026-09-06',
    '2 Days / 1 Night', 2, 2499, 'INR',
    'Challenging', 4.7, 0,
    'trekking', 'Aug - Feb', 0,
    'One of Karnataka''s toughest and most rewarding treks. Climb through shola forests and rolling grasslands in the Western Ghats to the Kumara Parvatha peak, with a sunrise summit view stretching to the Arabian Sea on a clear day.',
    '["Kumara Parvatha Peak Summit","Bhattara Mane Base Camp","Shola Forest & Grassland Trail","Sunrise from the Summit","Kukke Subramanya Temple"]'::jsonb, '[{"day":1,"title":"Kukke Subramanya to Bhattara Mane","description":"Begin the trek from Kukke Subramanya, climbing through dense forest to the Bhattara Mane base camp. Overnight camping."},{"day":2,"title":"Summit Push & Descent","description":"Pre-dawn climb to the Kumara Parvatha summit for sunrise, then descend back to Kukke Subramanya."}]'::jsonb, '["Trek Guide & Support Staff","Camping Equipment","All Meals During Trek","Forest Entry Permit","First Aid Support"]'::jsonb, 'null'::jsonb,
    'null'::jsonb, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'null'::jsonb, NULL, NULL,
    '{"lat":12.6167,"lng":75.65}'::jsonb, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"]'::jsonb, '[]'::jsonb,
    '["Leave No Trace","Community Tourism"]'::jsonb, true, 'active'
  ),
  (
    'kudremukh-trek', 'Kudremukh Trek', 'India',
    'trek', 'karnataka',
    'October 3 - 4, 2026', '2026-10-03', '2026-10-04',
    '2 Days / 1 Night', 2, 2299, 'INR',
    'Moderate', 4.6, 0,
    'trekking', 'Oct - Mar', 0,
    'A rolling, grassland trek through the Kudremukh National Park in the Western Ghats — named for its horse-face shaped peak. Expect river crossings, misty ridgelines and sweeping views across one of Karnataka''s richest biodiversity zones.',
    '["Kudremukh Peak Trail","Rolling Grassland Ridges","River Crossings","Western Ghats Biodiversity"]'::jsonb, '[{"day":1,"title":"Mullodi to Base Camp","description":"Trek from Mullodi village through forest and grassland trails to the base camp, with river crossings along the way. Overnight camping."},{"day":2,"title":"Summit & Return","description":"Climb to the Kudremukh peak for panoramic Western Ghats views, then trek back to Mullodi."}]'::jsonb, '["Trek Guide & Support Staff","Camping Equipment","All Meals During Trek","Forest Entry Permit","First Aid Support"]'::jsonb, 'null'::jsonb,
    'null'::jsonb, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'null'::jsonb, NULL, NULL,
    '{"lat":13.2167,"lng":75.2667}'::jsonb, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"]'::jsonb, '[]'::jsonb,
    '["Leave No Trace","Community Tourism"]'::jsonb, true, 'active'
  ),
  (
    'coorg-getaway-tour', 'Coorg Getaway', 'India',
    'tour', 'karnataka',
    'November 14 - 16, 2026', '2026-11-14', '2026-11-16',
    '3 Days / 2 Nights', 3, 12999, 'INR',
    'Easy', 4.8, 0,
    'cultural', 'Oct - Mar', 0,
    'A relaxed long weekend through Karnataka''s coffee country — misty estates, waterfalls and Kodava culture, close enough for a short getaway without giving up a full-blown holiday.',
    '["Coffee Estate Walk & Tasting","Abbey Falls","Raja''s Seat Sunset Point","Dubare Elephant Camp","Namdroling Golden Temple"]'::jsonb, '[{"day":1,"title":"Arrival & Raja''s Seat","description":"Arrive in Coorg, check in, and catch sunset at Raja''s Seat."},{"day":2,"title":"Coffee Estate, Abbey Falls & Dubare","description":"Guided coffee estate walk and tasting, Abbey Falls, and an afternoon at Dubare Elephant Camp."},{"day":3,"title":"Golden Temple & Departure","description":"Visit the Namdroling Golden Temple before departure."}]'::jsonb, '["Hotel Stay","Daily Breakfast","AC Transportation","Sightseeing as per itinerary","Tour Captain"]'::jsonb, 'null'::jsonb,
    'null'::jsonb, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'null'::jsonb, NULL, NULL,
    '{"lat":12.3375,"lng":75.8069}'::jsonb, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"]'::jsonb, '[]'::jsonb,
    '["Community Tourism"]'::jsonb, true, 'active'
  ),
  (
    'hampi-heritage-tour', 'Hampi Heritage Tour', 'India',
    'tour', 'national',
    'December 5 - 7, 2026', '2026-12-05', '2026-12-07',
    '3 Days / 2 Nights', 3, 9999, 'INR',
    'Easy', 4.7, 0,
    'cultural', 'Oct - Feb', 0,
    'Explore the UNESCO World Heritage ruins of the Vijayanagara Empire — boulder-strewn landscapes, ancient temples and centuries of history spread across Hampi''s open-air museum of a town.',
    '["Virupaksha Temple","Vittala Temple & Stone Chariot","Hampi Bazaar","Matanga Hill Sunrise","Tungabhadra River Coracle Ride"]'::jsonb, '[{"day":1,"title":"Arrival & Hampi Bazaar","description":"Arrive in Hampi, check in, and explore Hampi Bazaar and Virupaksha Temple."},{"day":2,"title":"Vittala Temple & Coracle Ride","description":"Visit the Vittala Temple and Stone Chariot, followed by a coracle ride on the Tungabhadra River."},{"day":3,"title":"Matanga Hill Sunrise & Departure","description":"Sunrise trek up Matanga Hill before departure."}]'::jsonb, '["Hotel Stay","Daily Breakfast","AC Transportation","Sightseeing as per itinerary","Tour Captain"]'::jsonb, 'null'::jsonb,
    'null'::jsonb, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'null'::jsonb, NULL, NULL,
    '{"lat":15.335,"lng":76.46}'::jsonb, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"]'::jsonb, '[]'::jsonb,
    '["Community Tourism"]'::jsonb, true, 'active'
  ),
  (
    'ujjain-omkareshwar-sep-2026', 'Ujjain – Omkareshwar Pilgrim Tour', 'India',
    'pilgrimage', 'national',
    'September 23 - 27, 2026', '2026-09-23', '2026-09-27',
    '5 Days / 4 Nights', 5, 35000, 'INR',
    'Easy', 0, 0,
    'cultural', 'Sep', 0,
    'A divine journey through two of India''s most revered Jyotirlinga shrines. Travel from Bengaluru to the temple city of Ujjain for Shri Mahakaleshwar darshan, then on to Omkareshwar on the banks of the Narmada — premium service at an affordable price, with flights, stay and transport taken care of.',
    '["Shri Mahakaleshwar Darshan","Omkareshwar Jyotirlinga Darshan","Harsiddhi Temple","Kal Bhairav Temple","Narmada Aarti","Scenic & Spiritual Experiences"]'::jsonb, '[]'::jsonb, '["Flight Tickets (Ex-Bengaluru)","3★ Hotel Accommodation","Daily Breakfast & Dinner","AC Transportation","Tour Captain"]'::jsonb, 'null'::jsonb,
    'null'::jsonb, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'null'::jsonb, NULL, NULL,
    '{"lat":23.1765,"lng":75.7885}'::jsonb, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"]'::jsonb, '[]'::jsonb,
    '["Community Tourism"]'::jsonb, true, 'active'
  ),
  (
    'dubai-dussehra-oct-2026', 'Dubai Dussehra Vacation Special', 'United Arab Emirates',
    'tour', 'international',
    'October 12 - 17, 2026', '2026-10-12', '2026-10-17',
    '6 Days / 5 Nights', 6, 115000, 'INR',
    'Easy', 0, 0,
    'cultural', 'Oct', 0,
    'Celebrate Dussehra in the dazzling city of Dubai. Six days of skyline views, desert adventure and shopping, flying out of Bengaluru and back — 4-star stay, meals, transport and a tour captain all included. Premium service at an affordable price.',
    '["Dubai City Experiences","Desert Safari","Shopping & Unforgettable Memories"]'::jsonb, '[]'::jsonb, '["Return Flights (Bengaluru – Bengaluru)","4★ Hotel Accommodation","Daily Breakfast & Dinner","A/C Tour Vehicle","Tour Captain"]'::jsonb, 'null'::jsonb,
    'null'::jsonb, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'null'::jsonb, NULL, NULL,
    '{"lat":25.2048,"lng":55.2708}'::jsonb, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"]'::jsonb, '[]'::jsonb,
    '[]'::jsonb, false, 'active'
  )
on conflict (id) do nothing;

insert into hero_slides (
  id, dest, country, tagline,
  date_start, date_end, dates, image,
  tour_id, status, sort_order
) values
  (
    'hero-bali', 'BALI', 'Indonesia', 'Where gods surf & time forgets itself',
    '2026-05-19', '2026-05-26', 'May 19 - 26, 2026', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&auto=format&fit=crop&q=85',
    'bali-may-2026', 'active', 0
  ),
  (
    'hero-sri-lanka', 'SRI LANKA', 'Pearl of the Indian Ocean', 'Beaches, tea country & timeless culture',
    '2026-08-06', '2026-08-11', 'August 6 - 11, 2026', 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=1920&auto=format&fit=crop&q=85',
    'sri-lanka-aug-2026', 'active', 1
  )
on conflict (id) do nothing;

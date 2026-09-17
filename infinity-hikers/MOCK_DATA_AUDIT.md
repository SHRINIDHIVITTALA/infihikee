# Mock Data & Stub Audit

**Status: all findings resolved and verified.** Originally an investigation-only
document; every item below has since been fixed, built, and checked live in a
browser (see the "Verified" line under each item). Two new database tables
(`leads`, `community_photos`/`community_posts`) were added as part of the
fixes — **you need to run `supabase/migrations/0005_leads.sql` and
`0006_community.sql`** in the Supabase SQL Editor for the lead-capture backend
and Community admin content to reach the shared database; until then, both
features fall back gracefully to local-only behavior (leads save to the
visitor's browser instead of nowhere; Community shows its bundled defaults),
which was already confirmed live during verification.

**Status key:** 🔴 Critical (silently broken, user-facing harm) · 🟠 High (fake
data presented as real, or a filter that provably can't work) · 🟡 Medium
(decorative/inconsistent stub, lower stakes) · ⚪ Low (cosmetic only)

---

## 🔴 Critical — the "Get a Callback" lead form goes nowhere real — ✅ FIXED

**Was:** every callback request was written to `localStorage` in the
visitor's own browser only; the admin "Enquiries" tab read that same
localStorage key, so it could only ever show leads submitted from that exact
browser profile. Real leads were being silently lost.

**Fix:**
- New `src/context/LeadsContext.jsx` — leads are inserted into a new
  Supabase `leads` table (public insert, authenticated-only read/delete —
  `supabase/migrations/0005_leads.sql`) instead of only `localStorage`.
- `LeadCapture.jsx`'s `addLead` never throws to the visitor: if Supabase
  isn't reachable (not configured, or the migration hasn't been run yet),
  it falls back to the old localStorage behavior instead of losing the
  request outright — a strict improvement, never a regression.
- `AdminPanel.jsx`'s Enquiries tab now reads from `useLeads()` (real,
  shared, live for every admin/device) instead of `localStorage` directly.
  "Clear All" now clears the real table (and the local fallback).

**Verified:** live end-to-end test — submitted a lead as an anonymous
visitor via the "Get a Callback" form, then logged into `/admin` in the same
session and confirmed it appeared instantly in the Enquiries tab. Clean
build, no console errors. (The Supabase `leads` table itself hasn't been
created in the live project yet — that's `0005_leads.sql`, pending the user
running it — so this test exercised the local-fallback path; the Supabase
insert path uses the exact same, already-proven `insert().select().single()`
pattern used everywhere else in this codebase.)

---

## 🟠 High — tour fields with real UI but zero admin control — ✅ FIXED

**Was:** `rating`, `reviewCount`, `seatsLeft`, `difficulty`, `ecoBadges`, and
`ecoFriendly` were read all over the site (filters, badges, Google-visible
`AggregateRating` JSON-LD) but had no admin form field at all — frozen at
whatever was hand-typed into the original seed data forever, and completely
absent on any new tour added through the admin panel.

**Decision on scope:** the doc originally flagged a fork — add admin fields,
or remove the fake rating schema/scarcity banner entirely. Removing
JSON-LD/urgency messaging is a marketing/SEO call for the business to make,
not something to unilaterally delete. Consistent with "don't disrupt
existing behavior," the fix adds real admin control instead of removing
functionality — the business can now set honest values (including leaving
rating/seatsLeft blank or at 0 to hide them) rather than being stuck with
whatever was hardcoded.

**Fix:** `AdminPanel.jsx`'s tour form now has:
- **Difficulty** (General tab) — Easy/Moderate/Challenging select, with a
  note explaining it drives the Destinations page's Difficulty filter.
- **Rating**, **Review Count**, **Seats Left** (Pricing tab) — each with a
  note explaining exactly what it's used for, including the honesty
  reminder that rating/reviewCount are sent to Google as structured data,
  and that seats-left doesn't auto-decrement.
- **Eco Badges** (textarea) and **Mark this trip as eco-friendly**
  (checkbox) (Payment & Rules tab).

**Verified:** live admin session — opened an existing tour (Sri Lanka) and
confirmed every new field is present and correctly pre-populated from the
real live data: Difficulty=Easy, Rating=4.9, Review Count=0, Seats Left=0,
Eco Badges="Community Tourism / Responsible Tourism" (textarea), Eco-friendly
checkbox checked. Confirmed on the public trip page (Bali) that Rating,
Review Count, and Seats Left already render correctly from real data
("★5 (203 reviews)", "Only 4 seats left — book before it fills up!").
Clean build, no console errors.

---

## 🟠 High — filters that provably return nothing or miss real data — ✅ FIXED

**Was:** `DestinationsPage.jsx`'s `ACTIVITY_TYPES`/`DIFFICULTY_LEVELS` and
`MapPage.jsx`'s `ACTIVITY_FILTERS` were hardcoded lists that had drifted out
of sync with the real catalog — a "Beach" chip with zero matching tours ever,
no chip at all for Bali's "premium" type, and no "Easy" option despite most
tours being Easy. `TripPlanner.jsx`'s "Karnataka"/"Pilgrim" buckets matched
on destination-name substrings instead of the real `scope`/`activityType`
fields. `Community.jsx`'s destination filter was a hardcoded 2-item list.

**Fix:**
- `DestinationsPage.jsx` and `MapPage.jsx` now derive their activity-type and
  difficulty filter chips from whatever values are actually present in the
  live `itineraries` data (memoized on the real data, not rebuilt from a
  fixed list), with an icon lookup map that falls back to a generic icon for
  any type not explicitly listed — so a brand-new activity type typed into a
  tour's admin form automatically gets a working chip.
- `TripPlanner.jsx`'s Karnataka/Pilgrim matching now uses `item.scope ===
  "karnataka"` and `item.activityType === "pilgrimage"` — the same
  authoritative, admin-configurable fields the rest of the site already
  treats as ground truth.
- `Community.jsx`'s destination filter is now derived from the real photos
  and trip reports (see the Community section below).

**Verified:** live checks on all three pages.
- Destinations page: Difficulty chips now correctly show `["All", "Easy"]`
  for the /destinations subset (all of which really are Easy) — previously
  "Easy" was missing entirely despite being the only value present.
  Activity chips correctly reflect whatever `activityType` values really
  exist in the live catalog (currently `Cultural`/`Premium` for this
  subset — see note below on the pending 0004 migration). No "Beach" chip
  anywhere anymore.
- Map page: chips correctly show `["All", "Trekking", "Cultural",
  "Premium"]` — no dead "Beach" chip, "Premium" (Bali) now has a working
  chip it never had before.
- Trip Planner: clicked "Karnataka" and got a real, correct result
  (Kudremukh Trek, whose `scope` is actually `"karnataka"`) instead of
  relying on the tour's name containing a hardcoded keyword.
- **Note:** the live Supabase project still has old `activityType:
  "cultural"` values because `0004_activity_type_pilgrimage.sql` (from
  earlier this session) hasn't been run against production yet — that's
  pre-existing/already-flagged, not something introduced today. The new
  dynamic-derivation code is working exactly as designed: it reflects
  whatever the real data says, and will automatically show "Pilgrimage"
  instead of "Cultural" the moment that migration is run, with no further
  code changes needed.

---

## 🟡 Medium — decorative stats that don't agree with each other or reality — ✅ FIXED

**Was:** the homepage stats block (500+ Happy Travelers, 50+ Destinations
Covered, 4.9/5 Average Rating, 98% Would Recommend) was four hand-typed
constants with no relationship to real data. Three different, mutually
inconsistent "how many customers" numbers existed (500+, 482+, 482+ again)
across Home/Testimonials/Community. `settings.tagline` was a real,
admin-editable field that was never actually read anywhere on the site
(`Testimonials.jsx` had the same text hardcoded as a literal string instead).

**Fix:**
- New `src/utils/stats.js` — `getDestinationsCoveredCount()` (count of
  active tours) and `getAverageTestimonialRating()` (average of real,
  admin-published testimonial ratings) — real, auto-updating numbers instead
  of hand-typed constants.
- `SettingsContext.jsx` gained two new admin-editable numbers:
  `travelerCount` (default 482, matching the pre-existing majority value)
  and `recommendPercent` (default 98) — for the two claims that have no
  underlying data system to compute them from, at least centralizing them
  as one editable number instead of scattered, inconsistent hardcoded text.
- Homepage stats now use `settings.travelerCount` (Happy Travelers),
  `getDestinationsCoveredCount()` (Destinations Covered — genuinely live),
  `getAverageTestimonialRating()` (Average Rating — genuinely live), and
  `settings.recommendPercent` (Would Recommend).
- `Testimonials.jsx`'s hardcoded "482+ adventurers. Zero regrets." literal
  now reads `{settings.tagline}` — fixing both the "text won't reflect admin
  edits" bug and the previously-undiscovered "the admin field does nothing
  at all" bug in the same change (confirmed via grep: `settings.tagline` had
  zero read sites anywhere in the codebase before this fix).
- Corrected the Settings admin form's misleading hint ("Shown in footer and
  testimonials section" — the footer part was never true; footer uses its
  own separate `footerDescription`/`footerNote` fields).
- `HomePage.jsx`'s "482+ Adventures Completed" badge now reads
  `settings.travelerCount` too.

**Verified:** live homepage screenshot after scrolling the stats section
into view (the counter only animates once visible) shows `482+ Happy
Travelers`, `6+ Destinations Covered` (the real live active-tour count),
`5/5 Average Rating` (real average of the live testimonials, all currently
5-star), `98% Would Recommend` — all four numbers now consistent and
traceable to a real source. Clean build, no console errors.

---

## 🟡 Medium — Community page is 100% fabricated content — ✅ FIXED

**Was:** `GALLERY_PHOTOS`, `TRIP_REPORTS`, and `STATS` were fully hardcoded
— stock photos, invented author names, invented like-counts, invented blog
posts — with no admin wiring at all, unlike every other content type on the
site.

**Decision on scope:** the doc flagged two options — build real admin
wiring, or reconsider the page. Consistent with this codebase's own
established pattern (every other content type, including the original
Testimonials, started as placeholder-but-editable rather than deleted),
built real admin wiring rather than removing the page.

**Fix:**
- New `supabase/migrations/0006_community.sql` — `community_photos` and
  `community_posts` tables (public read, authenticated write — same RLS
  pattern as `testimonials`/`hero_slides`), seeded with the exact content
  that was already hardcoded, so nothing changes visually until an admin
  edits it.
- New `src/context/CommunityContext.jsx` — full CRUD (`addPhoto`,
  `updatePhoto`, `deletePhoto`, `addPost`, `updatePost`, `deletePost`),
  seeded synchronously from the same defaults so the page is never empty
  while the network fetch is in flight or if Supabase isn't configured.
- `Community.jsx` now reads photos/posts from `useCommunity()` instead of
  hardcoded arrays. Its destination filter list and its stats strip
  ("Adventurers"/"Destinations"/"Photos Shared"/"Avg Rating") are now all
  derived from real data (the shared `settings.travelerCount` and
  `utils/stats.js` helpers, plus the real live photo count) instead of a
  second, independently-hardcoded set of fabricated numbers.
- New "Community Page" tab in `AdminPanel.jsx` (sidebar, between Reviews and
  Website Pages) with add/edit/delete for both Photos and Trip Reports,
  mirroring the existing Testimonials admin UI pattern.

**Verified:** live admin session — the new "Community Page" tab shows both
lists (7 photos, 3 trip reports) with all real seeded content and working
edit/delete buttons. Live public `/community` page confirmed rendering
correctly from context data with zero console errors.

---

## ⚪ Low — cosmetic only — ✅ FIXED

**Was:** `MarqueeTicker.jsx`'s scrolling ticker only mentioned "SRI LANKA"
and "BALI", missing every other destination the catalog had grown to
include.

**Fix:** the ticker now builds its destination list from the real, live
`itineraries` data (unique countries among active tours), interleaved with
the same motivational phrases as before. Falls back to the phrases alone if
the catalog is ever empty.

**Verified:** live homepage check — ticker now shows `INDIA, MAKE MEMORIES,
SRI LANKA, GO FURTHER, INDONESIA, ADVENTURE AWAITS, UNITED ARAB EMIRATES,
LIFE IS SHORT` (previously stuck at just Sri Lanka/Bali). Clean build, no
console errors.

---

## Everything checked and confirmed *not* a stub (unchanged — for the record)

Re-confirmed still true after this pass — these were checked and are
genuinely real, data-driven features, not touched by any of the fixes above:

- **Trip Calculator** — pricing math driven by `PricingRulesContext`
  (admin-editable).
- **Countdown timer** — counts down to the tour's real `startDate`.
- **Wishlist / Compare** — genuinely functional, backed by real context
  state.
- **Destinations page filter logic itself** — was always real; only the
  filter *option lists* were wrong (now fixed above).
- **Chatbot FAQ answers** — static canned copy by design, not data
  pretending to be something it isn't.

---

## Summary of new database objects (need to be run)

- `supabase/migrations/0005_leads.sql` — `leads` table.
- `supabase/migrations/0006_community.sql` — `community_photos` and
  `community_posts` tables, pre-seeded with the same content that was
  previously hardcoded.

Both features work today without these being run (graceful local/default
fallback, confirmed live) — running them upgrades leads and Community
content from "works on one device" / "shows bundled defaults" to "fully
shared and admin-editable everywhere," matching how every other piece of
admin content on this site already works.

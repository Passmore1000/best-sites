-- Sample data so the UI renders before the capture pipeline is live.
-- Screenshots use picsum.photos placeholders (full http URLs pass straight through
-- mediaUrl()); swap for real Storage paths once capture is wired.

-- ---------- tags ----------
insert into tags (slug, label, kind) values
  ('minimal',         'Minimal',          'style'),
  ('luxury',          'Luxury',           'style'),
  ('premium',         'Premium',          'style'),
  ('bold',            'Bold',             'style'),
  ('playful',         'Playful',          'style'),
  ('editorial',       'Editorial',        'style'),
  ('hero',            'Hero',             'section'),
  ('services',        'Services',         'section'),
  ('pricing',         'Pricing',          'section'),
  ('gallery',         'Gallery',          'section'),
  ('testimonials',    'Testimonials',     'section'),
  ('booking',         'Booking',          'section'),
  ('contact',         'Contact',          'section'),
  ('menu',            'Menu',             'section')
on conflict (slug) do nothing;

-- ---------- websites ----------
insert into websites (
  id, slug, name, url, domain, industry, status, summary, design_analysis,
  conversion_analysis, why_it_works, what_could_improve, strengths, weaknesses,
  meta_title, meta_description, favicon_url, og_image_url, tech_stack, cms, hosting,
  scores, published_at
) values
(
  '11111111-1111-1111-1111-111111111111',
  'atlas-builders', 'Atlas Builders', 'https://atlasbuilders.example.com', 'atlasbuilders.example.com',
  'Builder', 'published',
  'A confident, premium contractor site that leads with project photography and clear regional credibility.',
  'Large-format hero imagery, generous whitespace and a restrained type system give Atlas an established, high-end feel.',
  'Sticky quote CTA and trust badges keep conversion front-of-mind without feeling pushy.',
  'The portfolio-first layout lets the work do the selling, while every section funnels toward a free quote.',
  'Mobile nav hides the phone number behind a menu — a tap-to-call bar would lift lead volume.',
  '{"Striking project photography","Clear regional trust signals","Persistent quote CTA"}',
  '{"Phone number buried on mobile","Slow hero image on 3G"}',
  'Atlas Builders — Premium Home Construction', 'Award-winning home builders. View our portfolio and request a free quote.',
  'https://picsum.photos/seed/atlas-fav/64/64', 'https://picsum.photos/seed/atlas-og/1200/630',
  '["Next.js","Vercel","Sanity"]'::jsonb, 'Sanity', 'Vercel',
  '{"design":92,"mobile":86,"trust":90,"conversion":84,"performance":83,"overall":87}'::jsonb,
  now() - interval '10 days'
),
(
  '22222222-2222-2222-2222-222222222222',
  'clearflow-plumbing', 'ClearFlow Plumbing', 'https://clearflow.example.com', 'clearflow.example.com',
  'Plumber', 'published',
  'A fast, no-nonsense plumbing site built for emergency lead capture with a tap-to-call bar on every screen.',
  'Minimal, high-contrast layout prioritises legibility and speed over decoration — exactly right for the use case.',
  'A fixed call bar plus a 60-second booking form make it effortless to convert an anxious visitor.',
  'It removes every obstacle between a burst pipe and a phone call — speed and clarity win here.',
  'Lacks reviews near the CTA; social proof would reassure first-time callers.',
  '{"Persistent tap-to-call bar","Sub-1s load","Crystal-clear service areas"}',
  '{"Thin social proof","Generic stock imagery"}',
  'ClearFlow Plumbing — 24/7 Emergency Plumbers', 'Fast, reliable plumbing. Tap to call or book online in 60 seconds.',
  'https://picsum.photos/seed/clear-fav/64/64', 'https://picsum.photos/seed/clear-og/1200/630',
  '["WordPress","Cloudflare"]'::jsonb, 'WordPress', 'Cloudflare',
  '{"design":78,"mobile":94,"trust":80,"conversion":91,"performance":95,"overall":88}'::jsonb,
  now() - interval '8 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  'bright-smile-dental', 'Bright Smile Dental', 'https://brightsmile.example.com', 'brightsmile.example.com',
  'Dentist', 'published',
  'A calm, modern dental practice site organised entirely around booking an appointment online.',
  'Soft palette, rounded geometry and friendly photography reduce the anxiety associated with the dentist.',
  'The online booking widget is the hero — visible above the fold and repeated at every section break.',
  'Booking is frictionless and the tone is reassuring, which suits a nervous, decision-ready audience.',
  'Pricing is hidden behind a contact step; a transparent fee guide would build more trust.',
  '{"Reassuring, calming design","Booking widget above the fold","Strong before/after gallery"}',
  '{"No transparent pricing","Heavy hero video"}',
  'Bright Smile Dental — Book Online Today', 'Gentle, modern dentistry. Book your appointment online in minutes.',
  'https://picsum.photos/seed/bright-fav/64/64', 'https://picsum.photos/seed/bright-og/1200/630',
  '["Webflow"]'::jsonb, 'Webflow', 'Webflow',
  '{"design":88,"mobile":90,"trust":85,"conversion":87,"performance":82,"overall":86}'::jsonb,
  now() - interval '6 days'
),
(
  '44444444-4444-4444-4444-444444444444',
  'ironforge-gym', 'IronForge Gym', 'https://ironforge.example.com', 'ironforge.example.com',
  'Gym', 'published',
  'A bold, high-energy gym site that sells membership through motion, community photography and a free-trial offer.',
  'Heavy display type, dark theme and kinetic scroll animations create an unmistakably high-intensity brand.',
  'A single, repeated "Claim Free Trial" CTA plus member testimonials drive a clear conversion path.',
  'The brand energy is consistent everywhere and the free-trial offer lowers the barrier to walking in.',
  'Animation-heavy hero hurts performance on mid-range Android devices.',
  '{"Distinctive high-energy brand","Free-trial offer everywhere","Authentic community photos"}',
  '{"Animation-heavy, slower mobile","Pricing requires a form"}',
  'IronForge Gym — Claim Your Free Trial', 'Strength, conditioning and community. Claim your free 7-day trial today.',
  'https://picsum.photos/seed/iron-fav/64/64', 'https://picsum.photos/seed/iron-og/1200/630',
  '["Astro","Netlify"]'::jsonb, null, 'Netlify',
  '{"design":85,"mobile":79,"trust":78,"conversion":86,"performance":74,"overall":81}'::jsonb,
  now() - interval '4 days'
),
(
  '55555555-5555-5555-5555-555555555555',
  'maison-verde', 'Maison Verde', 'https://maisonverde.example.com', 'maisonverde.example.com',
  'Restaurant', 'published',
  'An editorial, luxury restaurant site where full-bleed photography and elegant typography set the dining mood.',
  'Serif display type, muted earth tones and slow fades evoke a refined, special-occasion experience.',
  'Reservations are one tap away via an embedded booking partner, with the menu as the secondary draw.',
  'It treats the website like part of the dining experience — atmosphere first, logistics close behind.',
  'The menu PDF opens in a new tab and is not mobile-friendly.',
  '{"Atmospheric editorial design","One-tap reservations","Beautiful food photography"}',
  '{"Menu is a non-responsive PDF","Slow initial paint"}',
  'Maison Verde — Modern European Dining', 'Seasonal European cuisine. Reserve your table online.',
  'https://picsum.photos/seed/maison-fav/64/64', 'https://picsum.photos/seed/maison-og/1200/630',
  '["Squarespace"]'::jsonb, 'Squarespace', 'Squarespace',
  '{"design":94,"mobile":83,"trust":82,"conversion":80,"performance":78,"overall":84}'::jsonb,
  now() - interval '2 days'
),
(
  '66666666-6666-6666-6666-666666666666',
  'lumen-interiors', 'Lumen Interiors', 'https://lumeninteriors.example.com', 'lumeninteriors.example.com',
  'Builder', 'draft',
  'A minimal interior-design studio portfolio — currently in draft pending review.',
  'Quiet, gallery-like layout with abundant whitespace and small, deliberate type.',
  'Enquiry is a single, understated contact link — appropriate for a high-end, low-volume studio.',
  null, null,
  '{"Gallery-like restraint","Confident whitespace"}', '{"Enquiry path is easy to miss"}',
  'Lumen Interiors — Design Studio', 'A minimal interior design studio.',
  'https://picsum.photos/seed/lumen-fav/64/64', 'https://picsum.photos/seed/lumen-og/1200/630',
  '["Framer"]'::jsonb, 'Framer', 'Framer',
  '{"design":90,"mobile":88,"trust":76,"conversion":70,"performance":89,"overall":82}'::jsonb,
  null
)
on conflict (id) do nothing;

-- ---------- media (desktop / mobile / full-page placeholders) ----------
insert into media (website_id, kind, storage_path, width, height) values
  ('11111111-1111-1111-1111-111111111111','desktop_shot','https://picsum.photos/seed/atlas-d/1280/800',1280,800),
  ('11111111-1111-1111-1111-111111111111','mobile_shot','https://picsum.photos/seed/atlas-m/390/844',390,844),
  ('11111111-1111-1111-1111-111111111111','fullpage_shot','https://picsum.photos/seed/atlas-f/1280/2600',1280,2600),
  ('22222222-2222-2222-2222-222222222222','desktop_shot','https://picsum.photos/seed/clear-d/1280/800',1280,800),
  ('22222222-2222-2222-2222-222222222222','mobile_shot','https://picsum.photos/seed/clear-m/390/844',390,844),
  ('22222222-2222-2222-2222-222222222222','fullpage_shot','https://picsum.photos/seed/clear-f/1280/2400',1280,2400),
  ('33333333-3333-3333-3333-333333333333','desktop_shot','https://picsum.photos/seed/bright-d/1280/800',1280,800),
  ('33333333-3333-3333-3333-333333333333','mobile_shot','https://picsum.photos/seed/bright-m/390/844',390,844),
  ('33333333-3333-3333-3333-333333333333','fullpage_shot','https://picsum.photos/seed/bright-f/1280/2500',1280,2500),
  ('44444444-4444-4444-4444-444444444444','desktop_shot','https://picsum.photos/seed/iron-d/1280/800',1280,800),
  ('44444444-4444-4444-4444-444444444444','mobile_shot','https://picsum.photos/seed/iron-m/390/844',390,844),
  ('44444444-4444-4444-4444-444444444444','fullpage_shot','https://picsum.photos/seed/iron-f/1280/2700',1280,2700),
  ('55555555-5555-5555-5555-555555555555','desktop_shot','https://picsum.photos/seed/maison-d/1280/800',1280,800),
  ('55555555-5555-5555-5555-555555555555','mobile_shot','https://picsum.photos/seed/maison-m/390/844',390,844),
  ('55555555-5555-5555-5555-555555555555','fullpage_shot','https://picsum.photos/seed/maison-f/1280/2800',1280,2800),
  ('66666666-6666-6666-6666-666666666666','desktop_shot','https://picsum.photos/seed/lumen-d/1280/800',1280,800)
on conflict (website_id, kind) do nothing;

-- ---------- website tags ----------
insert into website_tags (website_id, tag_slug) values
  ('11111111-1111-1111-1111-111111111111','premium'),
  ('11111111-1111-1111-1111-111111111111','bold'),
  ('11111111-1111-1111-1111-111111111111','hero'),
  ('11111111-1111-1111-1111-111111111111','gallery'),
  ('22222222-2222-2222-2222-222222222222','minimal'),
  ('22222222-2222-2222-2222-222222222222','contact'),
  ('22222222-2222-2222-2222-222222222222','services'),
  ('33333333-3333-3333-3333-333333333333','minimal'),
  ('33333333-3333-3333-3333-333333333333','booking'),
  ('33333333-3333-3333-3333-333333333333','testimonials'),
  ('44444444-4444-4444-4444-444444444444','bold'),
  ('44444444-4444-4444-4444-444444444444','premium'),
  ('44444444-4444-4444-4444-444444444444','pricing'),
  ('55555555-5555-5555-5555-555555555555','luxury'),
  ('55555555-5555-5555-5555-555555555555','editorial'),
  ('55555555-5555-5555-5555-555555555555','menu'),
  ('55555555-5555-5555-5555-555555555555','booking'),
  ('66666666-6666-6666-6666-666666666666','minimal'),
  ('66666666-6666-6666-6666-666666666666','premium'),
  ('66666666-6666-6666-6666-666666666666','gallery')
on conflict do nothing;

-- ---------- similar sites ----------
insert into similar_sites (website_id, related_id, relevance) values
  ('11111111-1111-1111-1111-111111111111','44444444-4444-4444-4444-444444444444',0.82),
  ('11111111-1111-1111-1111-111111111111','55555555-5555-5555-5555-555555555555',0.71),
  ('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333',0.79),
  ('33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222',0.79),
  ('44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111',0.82),
  ('55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111',0.71)
on conflict do nothing;

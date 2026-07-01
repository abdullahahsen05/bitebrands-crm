-- Bite Brands Partner CRM — Seed Data
-- Run AFTER 001_initial_schema.sql and AFTER creating auth users via setup-supabase.ts.
-- Auth user IDs must already exist in auth.users (via setup script).
--
-- Replace the UUID placeholders below with actual auth user UUIDs after running setup-supabase.ts.
-- The setup script prints these UUIDs.
--
-- Placeholder UUIDs — replace with output from setup-supabase.ts:
-- huib   → :UUID_HUIB
-- sanne  → :UUID_SANNE
-- kerem  → :UUID_KEREM
-- noor   → :UUID_NOOR
-- lotte  → :UUID_LOTTE
--
-- This file is also safe to re-run (uses ON CONFLICT DO NOTHING).

-- ─── Countries ───────────────────────────────────────────────────────────────

insert into countries (code, name, flag) values
  ('NL', 'Nederland',  '🇳🇱'),
  ('BE', 'België',     '🇧🇪'),
  ('DE', 'Duitsland',  '🇩🇪'),
  ('PL', 'Polen',      '🇵🇱'),
  ('CZ', 'Tsjechië',   '🇨🇿')
on conflict (code) do nothing;

-- ─── Concepts ────────────────────────────────────────────────────────────────

insert into concepts (id, name, color, sort_order) values
  ('chick', 'Chick''n Box',      '#E0962B', 0),
  ('smash', 'Smash Bird',        '#D63E3E', 1),
  ('fire',  'Fire Wing',         '#F0531C', 2),
  ('tasty', 'Tasty American',    '#2F6FB0', 3)
on conflict (id) do nothing;

-- ─── Onboarding steps ────────────────────────────────────────────────────────

insert into onboarding_steps (id, name, sub, optional, general, sort_order) values
  ('contract', 'Contract getekend',          'Franchiseovereenkomst ondertekend',  false, true,  0),
  ('docs',     'Alle documenten ontvangen',  'KvK, ID, IBAN e.d. compleet',         false, true,  1),
  ('tb',       'Aangemeld bij Thuisbezorgd', 'Aanmelding ingediend',                false, false, 2),
  ('ue',       'Aangemeld bij Uber Eats',    'Indien van toepassing',               true,  false, 3),
  ('onb',      'Onboarding partner klaar',   'Partner volledig ingericht',          false, false, 4),
  ('kassa',    'Kassa gekoppeld',            'Kassakoppeling actief',               false, false, 5),
  ('plan',     'Live datum gepland',         'Go-live datum vastgesteld',           false, false, 6),
  ('live',     'Live',                       'Vestiging is online',                 false, false, 7)
on conflict (id) do nothing;

-- ─── Custom fields ───────────────────────────────────────────────────────────

insert into custom_fields (id, label, type, sort_order) values
  ('kvk',     'KvK-nummer',       'text', 0),
  ('iban',    'IBAN',              'text', 1),
  ('address', 'Vestigingsadres',  'text', 2)
on conflict (id) do nothing;

-- ─── Platforms ───────────────────────────────────────────────────────────────

insert into platforms (id, name, kind, sort_order) values
  ('thuisbezorgd', 'Thuisbezorgd.nl', 'delivery', 0),
  ('ubereats',     'Uber Eats',       'delivery', 1),
  ('website',      'Eigen website',   'web',       2)
on conflict (id) do nothing;

-- ─── Message templates ───────────────────────────────────────────────────────

insert into message_templates (id, country_code, channel, title, subject, body) values
  ('tmpl-wa-NL',   'NL', 'wa',   'Welkom bij Bite Brands', null, 'Hoi {contactpersoon}! Welkom bij Bite Brands. We brengen {naam} in {stad} live met {concepten}.'),
  ('tmpl-mail-NL', 'NL', 'mail', 'Onboarding gestart', 'Welkom bij Bite Brands - {naam}', 'Beste {contactpersoon},\n\nWe starten de onboarding voor {concepten} in {stad}. Partner-ID: {partnerid}.'),
  ('tmpl-wa-BE',   'BE', 'wa',   'Welkom bij Bite Brands', null, 'Hoi {contactpersoon}! Welkom bij Bite Brands. We brengen {naam} in {stad} live met {concepten}.'),
  ('tmpl-mail-BE', 'BE', 'mail', 'Onboarding gestart', 'Welkom bij Bite Brands - {naam}', 'Beste {contactpersoon},\n\nWe starten de onboarding voor {concepten} in {stad}. Partner-ID: {partnerid}.'),
  ('tmpl-wa-DE',   'DE', 'wa',   'Welkom bij Bite Brands', null, 'Hoi {contactpersoon}! Welkom bij Bite Brands. We brengen {naam} in {stad} live met {concepten}.'),
  ('tmpl-mail-DE', 'DE', 'mail', 'Onboarding gestart', 'Welkom bij Bite Brands - {naam}', 'Beste {contactpersoon},\n\nWe starten de onboarding voor {concepten} in {stad}. Partner-ID: {partnerid}.'),
  ('tmpl-wa-PL',   'PL', 'wa',   'Welkom bij Bite Brands', null, 'Hoi {contactpersoon}! Welkom bij Bite Brands. We brengen {naam} in {stad} live met {concepten}.'),
  ('tmpl-mail-PL', 'PL', 'mail', 'Onboarding gestart', 'Welkom bij Bite Brands - {naam}', 'Beste {contactpersoon},\n\nWe starten de onboarding voor {concepten} in {stad}. Partner-ID: {partnerid}.'),
  ('tmpl-wa-CZ',   'CZ', 'wa',   'Welkom bij Bite Brands', null, 'Hoi {contactpersoon}! Welkom bij Bite Brands. We brengen {naam} in {stad} live met {concepten}.'),
  ('tmpl-mail-CZ', 'CZ', 'mail', 'Onboarding gestart', 'Welkom bij Bite Brands - {naam}', 'Beste {contactpersoon},\n\nWe starten de onboarding voor {concepten} in {stad}. Partner-ID: {partnerid}.')
on conflict (id) do nothing;

-- ─── Relation categories ─────────────────────────────────────────────────────

insert into relation_categories (name, sort_order) values
  ('Kassaleverancier', 0),
  ('Groothandel',      1),
  ('Verpakkingen',     2),
  ('Marketingbureau',  3),
  ('Boekhouding',      4),
  ('Overig',           5)
on conflict (name) do nothing;

-- ─── Portal settings ─────────────────────────────────────────────────────────

insert into settings (key, value) values
  ('portal_onboarding', '{"url": "https://aanmelden.bitebrands.nl"}'),
  ('portal_facturatie',  '{"url": "https://facturatie.bitebrands.nl"}'),
  ('portal_review',      '{"url": "https://reviews.bitebrands.nl"}')
on conflict (key) do update set value = excluded.value;

-- ─── Partners ────────────────────────────────────────────────────────────────

insert into partners (id, name, contact, city, country_code, phone, email, fee, created_at) values
  ('P001', 'Chick''n Box Tilburg Centrum', 'Sem de Vries',    'Tilburg',   'NL', '+31 6 1020 3040', 'tilburg@chick.partner',    12, now() - interval '42 days'),
  ('P002', 'Smash Bird Breda',             'Lotte Vermeer',   'Breda',     'NL', '+31 6 2233 4455', 'breda@smash.partner',       10, now() - interval '35 days'),
  ('P003', 'Fire Wing Antwerpen',          'Ana Peeters',     'Antwerpen', 'BE', '+32 3 223 8899',  'antwerpen@fire.partner',    15, now() - interval '28 days'),
  ('P004', 'Tasty American Berlin',        'David Koch',      'Berlin',    'DE', '+49 30 9988 4411','berlin@tasty.partner',       8, now() - interval '20 days'),
  ('P005', 'Chick''n Box Warszawa',        'Tomasz Kowalski', 'Warszawa',  'PL', '+48 22 123 6677', 'warszawa@chick.partner',    12, now() - interval '18 days'),
  ('P006', 'Smash Bird Praha',             'Pavel Novak',     'Praha',     'CZ', '+420 222 333 444','praha@smash.partner',       12, now() - interval '12 days')
on conflict (id) do nothing;

-- ─── Partner concepts ────────────────────────────────────────────────────────

insert into partner_concepts (partner_id, concept_id) values
  ('P001', 'chick'), ('P001', 'smash'),
  ('P002', 'smash'),
  ('P003', 'fire'),
  ('P004', 'tasty'),
  ('P005', 'chick'),
  ('P006', 'smash'), ('P006', 'fire')
on conflict do nothing;

-- ─── Partner general steps ────────────────────────────────────────────────────

insert into partner_general_steps (partner_id, step_id, done) values
  ('P001', 'contract', true),  ('P001', 'docs', true),
  ('P002', 'contract', true),  ('P002', 'docs', true),
  ('P003', 'contract', true),  ('P003', 'docs', false),
  ('P004', 'contract', false), ('P004', 'docs', false),
  ('P005', 'contract', true),  ('P005', 'docs', true),
  ('P006', 'contract', true),  ('P006', 'docs', true)
on conflict do nothing;

-- ─── Partner concept steps ───────────────────────────────────────────────────

insert into partner_concept_steps (partner_id, concept_id, step_id, done) values
  -- P001 chick
  ('P001','chick','tb',true),('P001','chick','ue',false),('P001','chick','onb',true),
  ('P001','chick','kassa',true),('P001','chick','plan',true),('P001','chick','live',true),
  -- P001 smash
  ('P001','smash','tb',true),('P001','smash','ue',true),('P001','smash','onb',true),
  ('P001','smash','kassa',false),('P001','smash','plan',true),('P001','smash','live',false),
  -- P002 smash
  ('P002','smash','tb',true),('P002','smash','ue',false),('P002','smash','onb',true),
  ('P002','smash','kassa',true),('P002','smash','plan',true),('P002','smash','live',true),
  -- P003 fire
  ('P003','fire','tb',true),('P003','fire','ue',false),('P003','fire','onb',false),
  ('P003','fire','kassa',false),('P003','fire','plan',false),('P003','fire','live',false),
  -- P004 tasty
  ('P004','tasty','tb',false),('P004','tasty','ue',false),('P004','tasty','onb',false),
  ('P004','tasty','kassa',false),('P004','tasty','plan',false),('P004','tasty','live',false),
  -- P005 chick
  ('P005','chick','tb',true),('P005','chick','ue',true),('P005','chick','onb',true),
  ('P005','chick','kassa',true),('P005','chick','plan',true),('P005','chick','live',true),
  -- P006 smash
  ('P006','smash','tb',true),('P006','smash','ue',false),('P006','smash','onb',true),
  ('P006','smash','kassa',true),('P006','smash','plan',true),('P006','smash','live',true),
  -- P006 fire
  ('P006','fire','tb',true),('P006','fire','ue',false),('P006','fire','onb',true),
  ('P006','fire','kassa',true),('P006','fire','plan',true),('P006','fire','live',true)
on conflict do nothing;

-- ─── Partner custom fields ───────────────────────────────────────────────────

insert into partner_custom (partner_id, field_id, value) values
  ('P001','kvk','62001991'),('P001','iban','NL91BUNQ2030405060'),('P001','address','Heuvelring 12, Tilburg'),
  ('P002','kvk','82112218'),('P002','iban','NL12BUNQ9988776655'),('P002','address','Grote Markt 4, Breda'),
  ('P003','kvk','BE0102030405'),('P003','iban','BE88000012345678'),('P003','address','Meir 22, Antwerpen'),
  ('P004','kvk','DE9988122'),('P004','iban','DE12500105170648489890'),('P004','address','Oranienstrasse 33, Berlin'),
  ('P005','kvk','PL88990011'),('P005','iban','PL10105000997603123456789123'),('P005','address','Marszalkowska 9, Warszawa'),
  ('P006','kvk','CZ77441122'),('P006','iban','CZ6508000000192000145399'),('P006','address','Karlovo namesti 10, Praha')
on conflict do nothing;

-- ─── Partner platforms ───────────────────────────────────────────────────────
-- Credentials are demo-only placeholders.
-- TODO (security hardening): replace pass field with vault reference.

insert into partner_platforms (partner_id, platform_id, active, login, pass, partner_external_id, url) values
  ('P001','thuisbezorgd',true,'tilburg@partner','demo123','TB10001',null),
  ('P001','ubereats',true,'tilburg@ue.partner','demo123','UE10001',null),
  ('P001','website',true,null,null,null,'https://tilburg.bitebrands-demo.nl'),
  ('P002','thuisbezorgd',true,'smash.breda@partner','demo123','TB11022',null),
  ('P002','ubereats',false,'','demo123','',null),
  ('P002','website',false,null,null,null,''),
  ('P003','thuisbezorgd',true,'antwerpen@partner','demo123','TB22001',null),
  ('P003','ubereats',false,'','demo123','',null),
  ('P003','website',true,null,null,null,'https://antwerpen.bitebrands-demo.be'),
  ('P004','thuisbezorgd',false,'','demo123','',null),
  ('P004','ubereats',false,'','demo123','',null),
  ('P004','website',false,null,null,null,''),
  ('P005','thuisbezorgd',true,'warszawa@partner','demo123','TB30021',null),
  ('P005','ubereats',true,'warszawa@ue.partner','demo123','UE30021',null),
  ('P005','website',false,null,null,null,''),
  ('P006','thuisbezorgd',true,'praha@partner','demo123','TB44011',null),
  ('P006','ubereats',false,'','demo123','',null),
  ('P006','website',true,null,null,null,'https://praha.bitebrands-demo.cz')
on conflict do nothing;

-- ─── Partner billing ─────────────────────────────────────────────────────────

insert into partner_billing (partner_id, concept_id, invoiced, live, verif_done, verif_code) values
  ('P001','chick',true,true,true,'481920'),
  ('P001','smash',false,false,false,''),
  ('P002','smash',false,true,false,''),
  ('P003','fire',false,false,false,''),
  ('P004','tasty',false,false,false,''),
  ('P005','chick',true,true,false,''),
  ('P006','smash',true,true,true,'203981'),
  ('P006','fire',false,true,true,'774129')
on conflict do nothing;

-- ─── Relations ───────────────────────────────────────────────────────────────

insert into relations (id, name, category_name, contact, phone, email, website, notes, created_at) values
  ('R001','KassaConnect B.V.','Kassaleverancier','Dennis Klaver','+31 20 123 4567','support@kassaconnect.nl','https://kassaconnect.nl','Levert kassakoppeling voor NL-vestigingen.',now() - interval '20 days'),
  ('R002','Family Chicken Groothandel','Groothandel','Inkoop','+31 161 22 33 44','orders@familychicken.nl','','Primaire leverancier kip en sauzen.',now() - interval '15 days'),
  ('R003','Verpakt! Verpakkingen','Verpakkingen','Lisa Bos','+31 13 555 6677','info@verpakt.nl','https://verpakt.nl','Branded verpakkingen per concept.',now() - interval '10 days')
on conflict (id) do nothing;

-- ─── Events ──────────────────────────────────────────────────────────────────
-- by_name stores a display name for audit trail. UUID links are added via setup script.

insert into events (id, partner_id, relation_id, kind, type, text, by_name, created_at) values
  ('e1','P001',null,'contact','call','Go-live voor Chick''n Box bevestigd.','Huib', now() - interval '3 days'),
  ('e2','P001',null,'system','system','Concept Smash Bird toegevoegd','Huib', now() - interval '8 days'),
  ('e3','P002',null,'contact','mail','Documenten per mail ontvangen.','Kerem', now() - interval '2 days'),
  ('e4','P003',null,'contact','wa','Checklist via WhatsApp gestuurd.','Kerem', now() - interval '4 days'),
  ('e5','P004',null,'system','system','Partner aangemaakt','Huib', now() - interval '1 day'),
  ('e6','P005',null,'contact','note','Live maar verificatie ontbreekt nog.','Sanne', now() - interval '1 day'),
  ('e7','P006',null,'contact','call','Facturatie voor Fire Wing nog toevoegen.','Sanne', now() - interval '30 hours'),
  ('re1',null,'R001','contact','mail','Koppelingsdocumentatie opgevraagd.','Huib', now() - interval '3 days'),
  ('re2',null,'R002','contact','wa','Prijslijst Q3 ontvangen.','Huib', now() - interval '5 days')
on conflict (id) do nothing;

-- ─── Tasks ───────────────────────────────────────────────────────────────────
-- assignee_id and created_by_id are set by the setup script after creating auth users.
-- Insert here as a template; setup script will run UPDATE to set UUIDs.

insert into tasks (id, title, description, partner_id, status, created_at) values
  ('t1','Verificatiecodes Thuisbezorgd controleren','Voor alle live vestigingen in NL de TB-verificatiecode bevestigen.','P005','open', now() - interval '2 days'),
  ('t2','Contract Smash Bird Gent natrekken','Getekend contract ontbreekt nog in het dossier.',null,'open', now() - interval '1 day'),
  ('t3','Kassakoppeling Eindhoven testen',null,null,'done', now() - interval '6 days')
on conflict (id) do nothing;

-- Note: chat_messages are seeded by setup-supabase.ts after auth users are created.
-- They reference by_user_id (UUID) which is only known after auth user creation.

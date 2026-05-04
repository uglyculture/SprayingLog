-- Run this in your Supabase SQL editor to set up the database

create table materials (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  suggested_dosage text not null default '',
  notes text not null default '',
  created_at timestamptz default now()
);

create table spray_logs (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  material_id uuid references materials(id) on delete restrict,
  concentration text not null default '',
  comment text not null default '',
  created_at timestamptz default now()
);

create index spray_logs_date_idx on spray_logs(date desc);
create index spray_logs_material_idx on spray_logs(material_id);

-- Seed materials from your history
insert into materials (name, suggested_dosage, notes) values
  ('Dipel', '1.25-1.5 g/l', 'Bacillus thuringiensis based insecticide. Use with WetCit.'),
  ('Madex', '1.2-1.7 ml/10l', 'Codling moth granulovirus. Dose increases through season.'),
  ('Vegesol RS', '8-10 ml/l', 'Mineral oil spray. Dormant/early season use.'),
  ('WetCit', '', 'Adjuvant/surfactant. Used together with Dipel.');

-- Seed your existing spray log data
-- First get material IDs
do $$
declare
  dipel_id uuid;
  madex_id uuid;
  vegesol_id uuid;
begin
  select id into dipel_id from materials where name = 'Dipel';
  select id into madex_id from materials where name = 'Madex';
  select id into vegesol_id from materials where name = 'Vegesol RS';

  -- 2024 season
  insert into spray_logs (date, material_id, concentration, comment) values
    ('2024-03-01', vegesol_id, '', ''),
    ('2024-05-01', dipel_id, '', 'wetcit. Harry masters, Ashton b. Tina, avrolles még virágzott azok wetcit nélkül. már volt kukac, de nem sok'),
    ('2024-05-11', dipel_id, '', 'wetcit. ami még virágzott wetcit nélkül'),
    ('2024-05-24', madex_id, '0.4ml/10l', ''),
    ('2024-05-30', dipel_id, '', 'wetcit'),
    ('2024-06-15', madex_id, '0.9ml/10l', ''),
    ('2024-06-24', dipel_id, '', 'wetcit'),
    ('2024-07-03', madex_id, '1.2ml/10l', ''),
    ('2024-07-11', dipel_id, '', 'wetcit'),
    ('2024-07-22', madex_id, '1.2ml/10l', ''),
    ('2024-07-31', dipel_id, '1.25g/l', 'wetcit'),
    ('2024-08-13', madex_id, '1.2ml/10l', '');

  -- 2025 season
  insert into spray_logs (date, material_id, concentration, comment) values
    ('2025-03-30', vegesol_id, '10ml/l', 'Frederick ig, az is félig'),
    ('2025-04-03', vegesol_id, '8ml/l', 'maradék'),
    ('2025-05-10', dipel_id, '', 'wetcit'),
    ('2025-05-19', madex_id, '1.6ml/10l', ''),
    ('2025-05-24', dipel_id, '1.5g/l', 'wetcit'),
    ('2025-05-31', madex_id, '1.6ml/10l', ''),
    ('2025-06-06', dipel_id, '1.5g/l', 'wetcit'),
    ('2025-06-13', madex_id, '1.7ml/10l', ''),
    ('2025-06-18', dipel_id, '1.5g/l', 'wetcit'),
    ('2025-06-25', madex_id, '1.7ml/10l', ''),
    ('2025-07-03', dipel_id, '1.5g/l', 'wetcit'),
    ('2025-07-11', madex_id, '1.7ml/10l', ''),
    ('2025-07-18', dipel_id, '1.25g/l', 'wetcit'),
    ('2025-07-28', dipel_id, '1.25g/l', 'wetcit'),
    ('2025-08-05', dipel_id, '1.25g/l', 'wetcit'),
    ('2025-08-12', dipel_id, '1.25g/l', ''),
    ('2025-08-19', dipel_id, '1.25g/l', 'wetcit'),
    ('2025-08-26', madex_id, '1.7ml/10l', ''),
    ('2025-09-03', dipel_id, '1.25g/l', 'wetcit'),
    ('2025-09-14', dipel_id, '1.25g/l', 'wetcit'),
    ('2025-11-16', vegesol_id, '10g/l', '');
end $$;

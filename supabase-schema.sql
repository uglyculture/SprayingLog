-- Fresh schema: drop old tables if they exist, then recreate
drop table if exists spray_logs;
drop table if exists spray_session_items;
drop table if exists spray_sessions;
drop table if exists materials;

create table materials (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  suggested_dosage text not null default '',
  default_unit text not null default '',
  notes text not null default '',
  created_at timestamptz default now()
);

create table spray_sessions (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  comment text not null default '',
  created_at timestamptz default now()
);

create table spray_session_items (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references spray_sessions(id) on delete cascade,
  material_id uuid references materials(id) on delete restrict,
  concentration text not null default '',
  unit text not null default ''
);

create index spray_sessions_date_idx on spray_sessions(date desc);
create index spray_session_items_session_idx on spray_session_items(session_id);

alter table materials enable row level security;
alter table spray_sessions enable row level security;
alter table spray_session_items enable row level security;

create policy "Allow all" on materials for all using (true) with check (true);
create policy "Allow all" on spray_sessions for all using (true) with check (true);
create policy "Allow all" on spray_session_items for all using (true) with check (true);

-- Seed materials
insert into materials (name, suggested_dosage, default_unit, notes) values
  ('Dipel', '1.25-1.5', 'g/l', 'Bacillus thuringiensis based insecticide.'),
  ('Madex', '1.2-1.7', 'ml/10l', 'Codling moth granulovirus. Dose increases through season.'),
  ('Vegesol RS', '8-10', 'ml/l', 'Mineral oil spray. Dormant/early season use.'),
  ('WetCit', '', '', 'Adjuvant/surfactant. Used together with Dipel.');

-- Seed spray sessions from historical data
do $$
declare
  dipel_id uuid;
  madex_id uuid;
  vegesol_id uuid;
  wetcit_id uuid;
  sid uuid;
begin
  select id into dipel_id from materials where name = 'Dipel';
  select id into madex_id from materials where name = 'Madex';
  select id into vegesol_id from materials where name = 'Vegesol RS';
  select id into wetcit_id from materials where name = 'WetCit';

  -- 2024 season
  insert into spray_sessions (date, comment) values ('2024-03-01', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, vegesol_id, '', '');

  insert into spray_sessions (date, comment) values ('2024-05-01', 'Harry masters, Ashton b. Tina, avrolles még virágzott azok wetcit nélkül. már volt kukac, de nem sok') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2024-05-11', 'ami még virágzott wetcit nélkül') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2024-05-24', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '0.4', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2024-05-30', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2024-06-15', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '0.9', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2024-06-24', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2024-07-03', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.2', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2024-07-11', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2024-07-22', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.2', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2024-07-31', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.25', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2024-08-13', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.2', 'ml/10l');

  -- 2025 season
  insert into spray_sessions (date, comment) values ('2025-03-30', 'Frederick ig, az is félig') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, vegesol_id, '10', 'ml/l');

  insert into spray_sessions (date, comment) values ('2025-04-03', 'maradék') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, vegesol_id, '8', 'ml/l');

  insert into spray_sessions (date, comment) values ('2025-05-10', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-05-19', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.6', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2025-05-24', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.5', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-05-31', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.6', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2025-06-06', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.5', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-06-13', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.7', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2025-06-18', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.5', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-06-25', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.7', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2025-07-03', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.5', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-07-11', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.7', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2025-07-18', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.25', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-07-28', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.25', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-08-05', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.25', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-08-12', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.25', 'g/l');

  insert into spray_sessions (date, comment) values ('2025-08-19', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.25', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-08-26', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, madex_id, '1.7', 'ml/10l');

  insert into spray_sessions (date, comment) values ('2025-09-03', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.25', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-09-14', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.25', 'g/l'), (sid, wetcit_id, '', '');

  insert into spray_sessions (date, comment) values ('2025-11-16', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, vegesol_id, '10', 'g/l');

  -- 2026 season
  insert into spray_sessions (date, comment) values ('2026-05-03', '') returning id into sid;
  insert into spray_session_items (session_id, material_id, concentration, unit) values (sid, dipel_id, '1.35', 'g/l'), (sid, wetcit_id, '', '');

end $$;

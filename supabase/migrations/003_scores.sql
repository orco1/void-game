create table scores (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) <= 20 and char_length(name) >= 1),
  score      integer not null check (score >= 0),
  level      integer not null check (level >= 1),
  created_at timestamptz default now()
);

create index scores_score_idx on scores (score desc);

alter table scores enable row level security;

create policy "Anyone can read scores" on scores for select using (true);
create policy "Anyone can insert scores" on scores for insert with check (true);

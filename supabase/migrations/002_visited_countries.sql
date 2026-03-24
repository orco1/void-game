create table public.visited_countries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  country_code text not null,
  created_at timestamptz default now(),
  unique (user_id, country_code)
);

alter table public.visited_countries enable row level security;

create policy "Users can view their own visited countries"
  on public.visited_countries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own visited countries"
  on public.visited_countries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own visited countries"
  on public.visited_countries for delete
  using (auth.uid() = user_id);

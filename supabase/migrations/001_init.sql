-- Supabase manages the auth.users table automatically.
-- Add your own tables here. Example:

-- create table public.profiles (
--   id uuid references auth.users(id) on delete cascade primary key,
--   display_name text,
--   created_at timestamptz default now()
-- );

-- alter table public.profiles enable row level security;

-- create policy "Users can view their own profile"
--   on public.profiles for select
--   using (auth.uid() = id);

-- create policy "Users can update their own profile"
--   on public.profiles for update
--   using (auth.uid() = id);

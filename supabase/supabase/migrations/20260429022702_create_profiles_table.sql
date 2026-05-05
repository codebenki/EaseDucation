create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  middle_name text,
  last_name text,
  updated_at timestamp with time zone
);

alter table profiles enable row level security;

create policy "Enable read access for all users"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
);
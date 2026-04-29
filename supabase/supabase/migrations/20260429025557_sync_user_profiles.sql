-- 1. Create the function that will be called by the trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, middle_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name', -- Extracts from the 'options.data' in your register service
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

-- 2. Create the trigger that runs the function after a user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- Fixes found in end-to-end testing:
-- 1. auth.admin.createUser writes app_metadata (with class_id) in a second
--    step after the insert, so the insert trigger saw no class. Also react
--    when app_metadata changes on a still-pending user.
-- 2. Purging student accounts through the Auth admin API could fail
--    silently. Delete them in SQL (cascades to profiles, submissions,
--    messages, devices) inside one function, and mark the class purged
--    in the same transaction. Only the service role may call it.

create or replace function public.handle_user_app_metadata()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_class uuid := nullif(new.raw_app_meta_data ->> 'class_id', '')::uuid;
begin
  if v_class is not null and v_class is distinct from nullif(old.raw_app_meta_data ->> 'class_id', '')::uuid then
    update public.profiles set role = 'student', class_id = v_class
    where id = new.id and role = 'pending';
  end if;
  return new;
end;
$$;

create trigger on_auth_user_app_metadata_updated
  after update of raw_app_meta_data on auth.users
  for each row execute function public.handle_user_app_metadata();

revoke execute on function public.handle_user_app_metadata() from public, anon, authenticated;

create or replace function public.purge_class_students(p_class_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_count integer;
begin
  delete from auth.users
  where id in (select id from public.profiles where class_id = p_class_id and role = 'student');
  get diagnostics v_count = row_count;
  update public.classes set purged_at = now(), published = false where id = p_class_id;
  return v_count;
end;
$$;

revoke execute on function public.purge_class_students(uuid) from public, anon, authenticated;
grant execute on function public.purge_class_students(uuid) to service_role;

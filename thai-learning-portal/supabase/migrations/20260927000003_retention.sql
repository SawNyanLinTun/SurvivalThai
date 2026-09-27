-- Student file storage + automatic data retention.
--
-- Files live in the private "class-files" bucket at
--   <class_id>/<student_id>/<file>
-- Every day, pg_cron calls the purge-expired Edge Function, which deletes
-- student files and accounts for classes past purge_after (start + 74 days).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('class-files', 'class-files', false, 10485760,
        array['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

-- Parse "<uuid>/..." safely (returns null for anything that isn't a uuid).
create or replace function public.path_segment_uuid(p_name text, p_index int)
returns uuid language plpgsql immutable set search_path = '' as $$
declare
  v text := split_part(p_name, '/', p_index);
begin
  if v ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return v::uuid;
  end if;
  return null;
end;
$$;

create policy "Students upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'class-files'
    and public.path_segment_uuid(name, 1) = public.current_class_id()
    and public.path_segment_uuid(name, 2) = (select auth.uid())
    and public.class_is_open(public.current_class_id())
  );
create policy "Students read own files" on storage.objects
  for select to authenticated
  using (bucket_id = 'class-files' and public.path_segment_uuid(name, 2) = (select auth.uid()));
create policy "Students replace own files" on storage.objects
  for update to authenticated
  using (bucket_id = 'class-files' and public.path_segment_uuid(name, 2) = (select auth.uid()));
create policy "Teachers read files of their classes" on storage.objects
  for select to authenticated
  using (bucket_id = 'class-files' and public.owns_class(public.path_segment_uuid(name, 1)));

-- Daily purge at 03:17 UTC (10:17 in Thailand / 09:47 in Myanmar).
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'purge-expired-classes',
  '17 3 * * *',
  $$
  select net.http_post(
    url := 'https://ttutmyqifrnxnpeoovvm.supabase.co/functions/v1/purge-expired',
    -- The public anon key only passes the gateway; the function itself
    -- only ever deletes classes already past their purge date.
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dXRteXFpZnJueG5wZW9vdnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NzU2NTUsImV4cCI6MjEwNTA1MTY1NX0.kwre1RtJbHbEzHZIl_pHwsRpG0CKgy63A5NKC2mfmt4'
    ),
    body := '{}'::jsonb
  );
  $$
);

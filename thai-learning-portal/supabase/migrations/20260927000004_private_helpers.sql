-- Hardening after the security advisor run:
-- 1. RLS helper functions move to a schema the REST API does not expose, so
--    they can't be called directly as /rest/v1/rpc/... (policies keep working:
--    they reference the functions by id, not by name).
-- 2. pg_net moves out of the public schema.

create schema if not exists private;
grant usage on schema private to authenticated;

alter function public.current_role_name() set schema private;
alter function public.current_class_id() set schema private;
alter function public.owns_class(uuid) set schema private;
alter function public.class_is_open(uuid) set schema private;
alter function public.path_segment_uuid(text, int) set schema private;

-- pg_net keeps its functions in the "net" schema; only the extension record moves.
drop extension if exists pg_net;
create extension pg_net with schema extensions;

-- Functions that call the helpers by name must point at the new schema.
create or replace function public.issue_certificate(p_class_id uuid, p_student_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_number text;
  v_student text;
  v_class text;
begin
  if not private.owns_class(p_class_id) then
    raise exception 'not allowed';
  end if;
  select number into v_number from public.certificates where class_id = p_class_id and student_id = p_student_id;
  if v_number is not null then
    return v_number;
  end if;
  select full_name into v_student from public.profiles where id = p_student_id and class_id = p_class_id;
  if v_student is null then
    raise exception 'student not in class';
  end if;
  select name into v_class from public.classes where id = p_class_id;

  v_number := 'ST-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.certificate_number_seq')::text, 5, '0');
  insert into public.certificates (number, class_id, student_id, student_name, class_name)
  values (v_number, p_class_id, p_student_id, v_student, v_class);
  return v_number;
end;
$$;

create or replace function public.revoke_certificate(p_class_id uuid, p_student_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.owns_class(p_class_id) then
    raise exception 'not allowed';
  end if;
  delete from public.certificates where class_id = p_class_id and student_id = p_student_id;
end;
$$;

create or replace function public.regenerate_join_code(p_class_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_code text;
begin
  if not private.owns_class(p_class_id) then
    raise exception 'not allowed';
  end if;
  loop
    v_code := public.random_join_code();
    exit when not exists (select 1 from public.classes where join_code = v_code);
  end loop;
  update public.classes set join_code = v_code where id = p_class_id;
  return v_code;
end;
$$;

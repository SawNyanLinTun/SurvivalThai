-- RPC functions called from the app.

-- Register the device a user is logging in from. Students may use at most
-- 2 devices; teachers are not limited. Returns 'ok' or 'limit'.
create or replace function public.register_device(p_device_id text, p_label text default '')
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  select role into v_role from public.profiles where id = v_uid;

  update public.user_devices set last_seen = now(), label = left(p_label, 100)
  where user_id = v_uid and device_id = p_device_id;
  if found then
    return 'ok';
  end if;

  if v_role = 'student' then
    -- serialize concurrent logins for the same user
    perform pg_advisory_xact_lock(hashtext(v_uid::text));
    if (select count(*) from public.user_devices where user_id = v_uid) >= 2 then
      return 'limit';
    end if;
  end if;

  insert into public.user_devices (user_id, device_id, label)
  values (v_uid, p_device_id, left(p_label, 100))
  on conflict (user_id, device_id) do update set last_seen = now();

  update public.profiles set last_active = current_date where id = v_uid;
  return 'ok';
end;
$$;

-- Teacher issues a certificate to one of their students.
create or replace function public.issue_certificate(p_class_id uuid, p_student_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_number text;
  v_student text;
  v_class text;
begin
  if not public.owns_class(p_class_id) then
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
  if not public.owns_class(p_class_id) then
    raise exception 'not allowed';
  end if;
  delete from public.certificates where class_id = p_class_id and student_id = p_student_id;
end;
$$;

-- Public certificate check, e.g. for employers. Reveals only what is printed on it.
create or replace function public.verify_certificate(p_number text)
returns table (number text, student_name text, class_name text, issued_on date)
language sql stable security definer set search_path = '' as $$
  select c.number, c.student_name, c.class_name, c.issued_on
  from public.certificates c where c.number = upper(trim(p_number))
$$;

-- New random join code for a class the caller owns.
create or replace function public.regenerate_join_code(p_class_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_code text;
begin
  if not public.owns_class(p_class_id) then
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

create or replace function public.random_join_code()
returns text language sql volatile set search_path = '' as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, 6)
$$;

-- Default join code for new classes.
alter table public.classes alter column join_code set default public.random_join_code();

-- Lock down function execution: only signed-in users (plus verify for everyone).
revoke execute on function public.register_device(text, text) from public, anon;
revoke execute on function public.issue_certificate(uuid, uuid) from public, anon;
revoke execute on function public.revoke_certificate(uuid, uuid) from public, anon;
revoke execute on function public.regenerate_join_code(uuid) from public, anon;
revoke execute on function public.current_role_name() from public, anon;
revoke execute on function public.current_class_id() from public, anon;
revoke execute on function public.owns_class(uuid) from public, anon;
revoke execute on function public.class_is_open(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_teacher_invite() from public, anon, authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- Column-level limits on updates, on top of RLS:
-- teachers may only change a student's progress, never role or class;
-- nobody may move a submission to another assignment or student.
revoke update on public.profiles from anon, authenticated;
grant update (progress) on public.profiles to authenticated;
revoke update on public.submissions from anon, authenticated;
grant update (content, file_path, submitted_at, status, score) on public.submissions to authenticated;
-- (a column-level revoke does not undo a table-level grant, so re-grant explicitly)
revoke update on public.classes from anon, authenticated;
grant update (name, level, description, schedule, letter, tone, published, join_code, settings, certificate, start_date)
  on public.classes to authenticated;

-- A leaked join code used to grant instant class access to anyone who had
-- it. join-class() now leaves a self-joined student at role='pending' with
-- class_id set to the requested class (a request, not membership); this
-- RPC is how the owning teacher turns that into real access. Rejecting a
-- request deletes the account instead (see manage-students' 'reject'
-- action), since only the service role may delete from auth.users.

create or replace function public.approve_join_request(p_student_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_class_id uuid;
begin
  select class_id into v_class_id from public.profiles where id = p_student_id and role = 'pending';
  if v_class_id is null then
    raise exception 'not found';
  end if;
  if not private.owns_class(v_class_id) then
    raise exception 'not allowed';
  end if;
  update public.profiles set role = 'student' where id = p_student_id;
end;
$$;

revoke execute on function public.approve_join_request(uuid) from public, anon;
grant execute on function public.approve_join_request(uuid) to authenticated, service_role;

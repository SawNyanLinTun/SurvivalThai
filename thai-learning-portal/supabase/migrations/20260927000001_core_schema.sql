-- SurvivalThai core schema: profiles, classes and class content.
-- Classes last 60 days; student data is purged 14 days after a class ends
-- (see 20260927000003_retention.sql). Teacher content and certificate
-- records are kept.

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------

-- Teacher allowlist: the existing public.teacher_emails table (created
-- 2026-09-15) is reused. Anyone whose email is listed there is a teacher.

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 200),
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  description text not null default '',
  schedule text not null default '',
  letter text not null default 'ก',
  tone text not null default 'primary' check (tone in ('primary', 'accent', 'highlight', 'success')),
  published boolean not null default false,
  join_code text not null unique,
  settings jsonb not null default '{"allowMessages": true, "allowLate": true, "showGrades": true, "instructionLanguage": "my"}',
  certificate jsonb not null default '{"enabled": true, "title": "", "minProgress": 80, "requireAllAssignments": true, "signer": "", "signerTitle": "Thai Language Teacher", "style": "classic"}',
  -- Every class runs exactly 60 days; student data is purged 14 days later.
  start_date date not null default current_date,
  end_date date generated always as (start_date + 60) stored,
  purge_after date generated always as (start_date + 74) stored,
  purged_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'pending' check (role in ('teacher', 'student', 'pending')),
  full_name text not null default '',
  email text not null default '',
  -- Students belong to exactly one class; their account ends with it.
  class_id uuid references public.classes (id) on delete cascade,
  progress smallint not null default 0 check (progress between 0 and 100),
  last_active date,
  created_at timestamptz not null default now(),
  check (role <> 'student' or class_id is not null)
);

alter table public.classes
  add constraint classes_teacher_id_fkey foreign key (teacher_id) references public.profiles (id) on delete cascade;

create index profiles_class_id_idx on public.profiles (class_id);
create index classes_teacher_id_idx on public.classes (teacher_id);
create index classes_purge_after_idx on public.classes (purge_after) where purged_at is null;

-- ---------------------------------------------------------------------------
-- Class content
-- ---------------------------------------------------------------------------

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index modules_class_id_idx on public.modules (class_id);

create table public.module_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  type text not null check (type in ('lesson', 'video', 'audio', 'file', 'link')),
  title text not null check (length(trim(title)) between 1 and 300),
  url text not null default '',
  content text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index module_items_module_id_idx on public.module_items (module_id);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  module_id uuid references public.modules (id) on delete set null,
  title text not null check (length(trim(title)) between 1 and 200),
  type text not null check (type in ('pronunciation', 'writing', 'quiz')),
  instructions text not null default '',
  due_date date,
  points integer not null default 10 check (points >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create index assignments_class_id_idx on public.assignments (class_id);
create index assignments_module_id_idx on public.assignments (module_id);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  content text not null default '',
  file_path text,
  status text not null default 'submitted' check (status in ('submitted', 'graded')),
  score integer check (score >= 0),
  submitted_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);
create index submissions_student_id_idx on public.submissions (student_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  -- null = class announcement; otherwise the private thread with this student
  thread_student_id uuid references public.profiles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index messages_class_id_idx on public.messages (class_id, created_at);
create index messages_thread_idx on public.messages (thread_student_id);
create index messages_sender_idx on public.messages (sender_id);

-- Certificates outlive student accounts so they can still be verified.
create sequence public.certificate_number_seq;

create table public.certificates (
  number text primary key,
  class_id uuid references public.classes (id) on delete set null,
  student_id uuid references public.profiles (id) on delete set null,
  student_name text not null,
  class_name text not null,
  issued_on date not null default current_date,
  unique (class_id, student_id)
);
create index certificates_student_id_idx on public.certificates (student_id);

-- Devices a student has logged in from (max 2 per student).
create table public.user_devices (
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id text not null check (length(device_id) between 8 and 100),
  label text not null default '',
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (user_id, device_id)
);

-- ---------------------------------------------------------------------------
-- Helper functions for RLS (security definer avoids recursive policy checks)
-- ---------------------------------------------------------------------------

create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function public.current_class_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select class_id from public.profiles where id = (select auth.uid()) and role = 'student'
$$;

create or replace function public.owns_class(p_class_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes where id = p_class_id and teacher_id = (select auth.uid()))
$$;

-- Student may still act (submit, message) until the class end date.
create or replace function public.class_is_open(p_class_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes where id = p_class_id and published and current_date <= end_date)
$$;

-- ---------------------------------------------------------------------------
-- New auth user -> profile. Role comes from the invite list or from
-- app_metadata (only settable server-side), never from client input.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_class uuid := nullif(new.raw_app_meta_data ->> 'class_id', '')::uuid;
  v_role text;
begin
  if exists (select 1 from public.teacher_emails where lower(email) = lower(new.email)) then
    v_role := 'teacher';
    v_class := null;
  elsif v_class is not null then
    v_role := 'student';
  else
    v_role := 'pending';
  end if;

  insert into public.profiles (id, role, full_name, email, class_id)
  values (new.id, v_role, coalesce(new.raw_user_meta_data ->> 'full_name', ''), lower(new.email), v_class);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Promote an existing pending user when their email is added to the teacher list.
create or replace function public.handle_teacher_invite()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set role = 'teacher', class_id = null
  where email = lower(new.email) and role = 'pending';
  return new;
end;
$$;

create trigger on_teacher_email_added
  after insert on public.teacher_emails
  for each row execute function public.handle_teacher_invite();

-- Profiles for users that existed before this migration.
insert into public.profiles (id, role, full_name, email)
select u.id,
       case when exists (select 1 from public.teacher_emails t where lower(t.email) = lower(u.email)) then 'teacher' else 'pending' end,
       coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
       lower(u.email)
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.modules enable row level security;
alter table public.module_items enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.messages enable row level security;
alter table public.certificates enable row level security;
alter table public.user_devices enable row level security;

-- profiles
create policy "Users read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Teachers read their students" on public.profiles
  for select to authenticated using (public.owns_class(class_id));
create policy "Teachers update their students' progress" on public.profiles
  for update to authenticated using (public.owns_class(class_id)) with check (public.owns_class(class_id));
create policy "Students read their teacher" on public.profiles
  for select to authenticated
  using (id = (select teacher_id from public.classes where id = public.current_class_id()));

-- classes
create policy "Teachers manage own classes" on public.classes
  for all to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()) and public.current_role_name() = 'teacher');
create policy "Students read their published class" on public.classes
  for select to authenticated using (published and id = public.current_class_id());

-- modules
create policy "Teachers manage modules" on public.modules
  for all to authenticated using (public.owns_class(class_id)) with check (public.owns_class(class_id));
create policy "Students read published modules" on public.modules
  for select to authenticated using (published and class_id = public.current_class_id());

-- module items
create policy "Teachers manage module items" on public.module_items
  for all to authenticated
  using (exists (select 1 from public.modules m where m.id = module_id and public.owns_class(m.class_id)))
  with check (exists (select 1 from public.modules m where m.id = module_id and public.owns_class(m.class_id)));
create policy "Students read items of published modules" on public.module_items
  for select to authenticated
  using (exists (select 1 from public.modules m where m.id = module_id and m.published and m.class_id = public.current_class_id()));

-- assignments
create policy "Teachers manage assignments" on public.assignments
  for all to authenticated using (public.owns_class(class_id)) with check (public.owns_class(class_id));
create policy "Students read published assignments" on public.assignments
  for select to authenticated using (published and class_id = public.current_class_id());

-- submissions
create policy "Teachers read submissions" on public.submissions
  for select to authenticated
  using (exists (select 1 from public.assignments a where a.id = assignment_id and public.owns_class(a.class_id)));
create policy "Teachers grade submissions" on public.submissions
  for update to authenticated
  using (exists (select 1 from public.assignments a where a.id = assignment_id and public.owns_class(a.class_id)))
  with check (exists (select 1 from public.assignments a where a.id = assignment_id and public.owns_class(a.class_id)));
create policy "Students read own submissions" on public.submissions
  for select to authenticated using (student_id = (select auth.uid()));
create policy "Students submit to open assignments" on public.submissions
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and status = 'submitted' and score is null
    and exists (
      select 1 from public.assignments a join public.classes c on c.id = a.class_id
      where a.id = assignment_id and a.published and c.id = public.current_class_id()
        and public.class_is_open(c.id)
        and (a.due_date is null or current_date <= a.due_date or (c.settings ->> 'allowLate')::boolean)
    )
  );
create policy "Students update ungraded submissions" on public.submissions
  for update to authenticated
  using (student_id = (select auth.uid()) and status = 'submitted')
  with check (student_id = (select auth.uid()) and status = 'submitted' and score is null);

-- messages
create policy "Teachers read class messages" on public.messages
  for select to authenticated using (public.owns_class(class_id));
create policy "Teachers send messages" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid()) and public.owns_class(class_id)
    and (thread_student_id is null
         or exists (select 1 from public.profiles p where p.id = thread_student_id and p.class_id = messages.class_id))
  );
create policy "Students read announcements and own thread" on public.messages
  for select to authenticated
  using (class_id = public.current_class_id() and (thread_student_id is null or thread_student_id = (select auth.uid())));
create policy "Students reply in own thread" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid()) and thread_student_id = (select auth.uid())
    and class_id = public.current_class_id() and public.class_is_open(class_id)
    and exists (select 1 from public.classes c where c.id = class_id and (c.settings ->> 'allowMessages')::boolean)
  );

-- certificates (issued/revoked through functions below)
create policy "Teachers read certificates of their classes" on public.certificates
  for select to authenticated using (public.owns_class(class_id));
create policy "Students read own certificate" on public.certificates
  for select to authenticated using (student_id = (select auth.uid()));

-- devices
create policy "Users read own devices" on public.user_devices
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Teachers read their students' devices" on public.user_devices
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = user_id and public.owns_class(p.class_id)));
create policy "Teachers reset their students' devices" on public.user_devices
  for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = user_id and public.owns_class(p.class_id)));

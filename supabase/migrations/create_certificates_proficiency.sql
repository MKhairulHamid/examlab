-- Proficiency credential: certificates table + issuance/verification RPCs.
-- A credential is earned by completing all study sessions for a program AND
-- passing that program's final mock exam (>=70%). See plan: Proficiency Credential.

-- 1. Mark which question set gates the credential (the program's final mock exam).
alter table public.question_sets
  add column if not exists is_final_exam boolean not null default false;

-- 2. Certificates table.
create table if not exists public.certificates (
  id               uuid primary key default extensions.uuid_generate_v4(),
  credential_code  text not null unique,                 -- e.g. CEL-SAA-2026-0042
  user_id          uuid not null references auth.users(id) on delete cascade,
  recipient_name   text not null,                         -- snapshot of full_name at issue time
  program_code     text not null,                         -- 'SAA-C03'
  program_name     text not null,                         -- snapshot of exam_types.name
  exam_attempt_id  uuid references public.exam_attempts(id) on delete set null,
  percentage_score numeric(5,2) not null,
  scaled_score     integer,
  sessions_total   integer,
  issued_at        timestamptz not null default timezone('utc', now()),
  revoked          boolean not null default false,
  created_at       timestamptz not null default timezone('utc', now()),
  constraint certificates_user_program_unique unique (user_id, program_code)
);

create index if not exists idx_certificates_user on public.certificates(user_id);

-- Sequence for the human-friendly credential number.
create sequence if not exists public.certificates_seq start 1;

-- 3. RLS: owner can read their own certs. No client INSERT/UPDATE/DELETE —
--    issuance and public verification both go through SECURITY DEFINER RPCs.
alter table public.certificates enable row level security;

drop policy if exists "owner reads own certificates" on public.certificates;
create policy "owner reads own certificates" on public.certificates
  for select to authenticated
  using (auth.uid() = user_id);

-- 4. Public verification RPC — returns a single cert by code (no table-wide read,
--    so recipients can't be enumerated).
create or replace function public.get_certificate_by_code(p_code text)
returns table (
  credential_code  text,
  recipient_name   text,
  program_code     text,
  program_name     text,
  percentage_score numeric,
  scaled_score     integer,
  sessions_total   integer,
  issued_at        timestamptz,
  revoked          boolean
)
language sql
security definer
set search_path = public
as $$
  select credential_code, recipient_name, program_code, program_name,
         percentage_score, scaled_score, sessions_total, issued_at, revoked
  from public.certificates
  where credential_code = upper(trim(p_code))
  limit 1;
$$;

-- 5. Issuance RPC — validates eligibility server-side and issues (idempotent).
create or replace function public.issue_certificate(p_program_code text, p_sessions_total integer)
returns public.certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_exam     record;
  v_attempt  record;
  v_done     integer;
  v_name     text;
  v_email    text;
  v_code     text;
  v_existing public.certificates;
  v_result   public.certificates;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Resolve the program / exam type (exam_types.slug is the lowercase code).
  select id, name, slug into v_exam
  from public.exam_types
  where lower(slug) = lower(p_program_code) and is_active
  limit 1;
  if v_exam.id is null then
    raise exception 'Unknown program: %', p_program_code;
  end if;

  -- Idempotent: return the existing certificate if already issued.
  select * into v_existing
  from public.certificates
  where user_id = v_uid and program_code = upper(p_program_code)
  limit 1;
  if v_existing.id is not null then
    return v_existing;
  end if;

  -- Gate 1 (non-spoofable): a passed attempt on the program's final exam.
  select ea.id, ea.percentage_score, ea.scaled_score
    into v_attempt
  from public.exam_attempts ea
  join public.question_sets qs on qs.id = ea.question_set_id
  where ea.user_id = v_uid
    and ea.passed = true
    and ea.status = 'completed'
    and qs.is_final_exam = true
    and qs.exam_type_id = v_exam.id
  order by ea.percentage_score desc nulls last, ea.completed_at desc
  limit 1;
  if v_attempt.id is null then
    raise exception 'Final exam not yet passed for %', p_program_code;
  end if;

  -- Gate 2: all study sessions complete (count from study_course_progress).
  select coalesce(jsonb_array_length(completed_sessions), 0) into v_done
  from public.study_course_progress
  where user_id = v_uid and course_slug = v_exam.slug
  limit 1;
  v_done := coalesce(v_done, 0);
  if p_sessions_total is null or p_sessions_total < 1 then
    raise exception 'Invalid sessions_total';
  end if;
  if v_done < p_sessions_total then
    raise exception 'Study not complete (% of % sessions)', v_done, p_sessions_total;
  end if;

  -- Recipient name snapshot (full_name, else email local-part).
  select full_name, email into v_name, v_email
  from public.profiles where id = v_uid limit 1;
  if v_name is null or length(trim(v_name)) = 0 then
    v_name := split_part(coalesce(v_email, 'Learner'), '@', 1);
  end if;

  -- Credential code: CEL-<CODE>-<YYYY>-<NNNN> (sequence only burned on real issue).
  v_code := 'CEL-' || upper(split_part(p_program_code, '-', 1))
         || '-' || to_char(timezone('utc', now()), 'YYYY')
         || '-' || lpad(nextval('public.certificates_seq')::text, 4, '0');

  insert into public.certificates (
    credential_code, user_id, recipient_name, program_code, program_name,
    exam_attempt_id, percentage_score, scaled_score, sessions_total
  ) values (
    v_code, v_uid, v_name, upper(p_program_code), v_exam.name,
    v_attempt.id, v_attempt.percentage_score, v_attempt.scaled_score, p_sessions_total
  )
  returning * into v_result;

  return v_result;
end;
$$;

-- 6. Grants. get_certificate_by_code is intentionally anon-callable (public
--    verification). issue_certificate is authenticated-only — revoke the default
--    PUBLIC grant so anon can't reach it (least privilege).
grant execute on function public.get_certificate_by_code(text) to anon, authenticated;
revoke execute on function public.issue_certificate(text, integer) from public, anon;
grant execute on function public.issue_certificate(text, integer) to authenticated;

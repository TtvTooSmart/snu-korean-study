-- Read-only admin reporting. Existing student table policies remain owner-only.
create schema if not exists study_admin;
revoke all on schema study_admin from public, anon, authenticated;
grant usage on schema study_admin to authenticated;

create or replace function study_admin.read_student_progress(
  p_search text default '', p_offset integer default 0, p_limit integer default 25
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  result jsonb;
begin
  -- Check the server's current account record, never client-editable metadata
  -- or a supplied email/user ID. Revocation takes effect on the next request.
  if caller is null or not exists (
    select 1 from auth.users u where u.id=caller
      and lower(u.email)='shivamj8866@gmail.com'
      and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
  ) then raise exception 'Administrator access required' using errcode='42501'; end if;
  if p_offset is null or p_offset<0 or p_offset>100000
     or p_limit is null or p_limit<1 or p_limit>50
     or p_search is null or length(p_search)>100 then
    raise exception 'Invalid student search or page' using errcode='22023';
  end if;
  with students as (
    select u.id as user_id, u.email, u.created_at,
      p.updated_at as synced_at, coalesce(p.stats,'{}'::jsonb) as stats
    from auth.users u left join public.study_progress p on p.user_id=u.id
    where u.id<>caller and u.email_confirmed_at is not null
      and not coalesce(u.is_anonymous,false)
      and strpos(lower(coalesce(u.email,'')),lower(trim(p_search)))>0
  ), page as (
    select * from students order by email,user_id offset p_offset limit p_limit
  ) select jsonb_build_object(
      'total',(select count(*) from students),
      'students',coalesce((select jsonb_agg(to_jsonb(page) order by email,user_id) from page),'[]'::jsonb)
    ) into result;
  return result;
end;
$$;
revoke all on function study_admin.read_student_progress(text,integer,integer) from public, anon, authenticated;
grant execute on function study_admin.read_student_progress(text,integer,integer) to authenticated;

-- The exposed endpoint is an invoker; only the guarded private function can
-- read across students. It exposes no mutation or access to auth secrets.
create or replace function public.admin_student_progress(
  p_search text default '', p_offset integer default 0, p_limit integer default 25
) returns jsonb language sql stable security invoker set search_path = '' as $$
  select study_admin.read_student_progress(p_search,p_offset,p_limit);
$$;
revoke all on function public.admin_student_progress(text,integer,integer) from public, anon, authenticated;
grant execute on function public.admin_student_progress(text,integer,integer) to authenticated;

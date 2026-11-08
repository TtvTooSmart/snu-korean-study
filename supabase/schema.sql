-- Run once in the Supabase SQL editor for this app's project.
create table if not exists public.study_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stats jsonb not null default '{}'::jsonb check (jsonb_typeof(stats) = 'object'),
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.study_progress enable row level security;
drop policy if exists "Read own progress" on public.study_progress;
create policy "Read own progress" on public.study_progress
  for select to authenticated using ((select auth.uid()) = user_id);
-- Only the narrowly scoped RPC can write. The browser never supplies a user ID to it.
revoke all on public.study_progress from anon, authenticated;
grant select on public.study_progress to authenticated;
create or replace function public.save_study_progress(expected_revision bigint, new_stats jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := auth.uid();
  current_row public.study_progress;
begin
  if current_user_id is null then raise exception 'Sign in to save progress'; end if;
  if jsonb_typeof(new_stats) <> 'object' or octet_length(new_stats::text) > 2000000 then
    raise exception 'Invalid progress payload';
  end if;
  insert into public.study_progress(user_id) values(current_user_id) on conflict do nothing;
  select * into current_row from public.study_progress where user_id=current_user_id for update;
  if current_row.revision <> expected_revision then
    return jsonb_build_object('saved',false,'stats',current_row.stats,'revision',current_row.revision);
  end if;
  update public.study_progress set stats=new_stats, revision=revision+1, updated_at=now()
    where user_id=current_user_id returning * into current_row;
  return jsonb_build_object('saved',true,'revision',current_row.revision);
end;
$$;
revoke all on function public.save_study_progress(bigint,jsonb) from public, anon;
grant execute on function public.save_study_progress(bigint,jsonb) to authenticated;

-- Run with an administrative SQL connection. All fixtures are rolled back.
begin;
create temporary table dashboard_test_ids as select
  gen_random_uuid() as student_a, gen_random_uuid() as student_b,
  (select id from auth.users where lower(email)='shivamj8866@gmail.com' and email_confirmed_at is not null) as admin;
grant select on dashboard_test_ids to authenticated;
insert into auth.users(id,email,aud,role,email_confirmed_at,raw_user_meta_data)
select student_a,'dashboard-test-'||student_a||'@example.invalid','authenticated','authenticated',now(),
  '{"role":"admin","email":"shivamj8866@gmail.com"}'::jsonb from dashboard_test_ids
union all select student_b,'dashboard-test-'||student_b||'@example.invalid','authenticated','authenticated',now(),'{}'::jsonb from dashboard_test_ids;
insert into public.study_progress(user_id,stats)
select student_a,'{"test-word":{"seen":2,"missed":1,"streak":1}}'::jsonb from dashboard_test_ids;
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',student_a,'role','authenticated','email','shivamj8866@gmail.com')::text,true) from dashboard_test_ids;
do $$ begin
  begin
    perform public.admin_student_progress();
    raise exception 'FAIL: student reached dashboard';
  exception when insufficient_privilege then null; end;
  begin
    perform study_admin.read_student_progress();
    raise exception 'FAIL: student reached private function';
  exception when insufficient_privilege then null; end;
  if (select count(*) from public.study_progress where user_id in (select student_a from dashboard_test_ids union select student_b from dashboard_test_ids))<>1 then
    raise exception 'FAIL: student own progress read';
  end if;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',student_b,'role','authenticated')::text,true) from dashboard_test_ids;
do $$ begin
  if exists(select 1 from public.study_progress where user_id=(select student_a from dashboard_test_ids)) then
    raise exception 'FAIL: cross-student table read';
  end if;
  update public.study_progress set stats='{}' where user_id=(select student_a from dashboard_test_ids);
  if found then raise exception 'FAIL: cross-student write'; end if;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',admin,'role','authenticated')::text,true) from dashboard_test_ids;
do $$ declare result jsonb; begin
  result:=public.admin_student_progress('dashboard-test-',0,25);
  if (result->>'total')::integer<>2 or jsonb_array_length(result->'students')<>2 then
    raise exception 'FAIL: admin read';
  end if;
  if not exists(select 1 from jsonb_array_elements(result->'students') s where s->'stats'->'test-word'->>'seen'='2') then
    raise exception 'FAIL: progress missing';
  end if;
  if jsonb_array_length(public.admin_student_progress('dashboard-test-',1,1)->'students')<>1 then
    raise exception 'FAIL: pagination';
  end if;
  begin perform public.admin_student_progress('',0,100);raise exception 'FAIL: unbounded request';
  exception when invalid_parameter_value then null;end;
end $$;
reset role;
do $$ begin
 if has_function_privilege('anon','public.admin_student_progress(text,integer,integer)','execute')
   or has_function_privilege('anon','study_admin.read_student_progress(text,integer,integer)','execute') then
   raise exception 'FAIL: anonymous execute permission';
 end if;
 if has_table_privilege('authenticated','auth.users','select') then raise exception 'FAIL: exposed users table'; end if;
end $$;
rollback;
select 'PASS: admin reads, student/anonymous restrictions, metadata spoof protection, pagination and owner-only writes; fixtures rolled back' as result;

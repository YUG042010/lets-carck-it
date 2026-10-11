-- Run this once in Supabase > SQL Editor
create table profiles(id uuid primary key references auth.users on delete cascade, name text not null, role text not null default 'member' check(role in('leader','co_leader','member')));
create table resources(id bigint generated always as identity primary key, subject text not null, chapter text, kind text not null check(kind in('material','exam')), title text not null, url text not null, added_by uuid default auth.uid(), added_by_name text, created_at timestamptz default now());
create table messages(id bigint generated always as identity primary key, user_id uuid default auth.uid(), name text, body text not null check(length(body)<=1000), created_at timestamptz default now());

create function is_staff() returns boolean language sql security definer set search_path=public stable as $$select exists(select 1 from profiles where id=auth.uid() and role in('leader','co_leader'))$$;
create function is_leader() returns boolean language sql security definer set search_path=public stable as $$select exists(select 1 from profiles where id=auth.uid() and role='leader')$$;
create function new_user() returns trigger language plpgsql security definer set search_path=public as $$begin insert into profiles(id,name) values(new.id,initcap(split_part(new.email,'@',1)));return new;end$$;
create trigger on_signup after insert on auth.users for each row execute function new_user();

alter table profiles enable row level security;
alter table resources enable row level security;
alter table messages enable row level security;
create policy "read" on profiles for select to authenticated using(true);
create policy "leader changes roles" on profiles for update to authenticated using(is_leader()) with check(is_leader());
create policy "read" on resources for select to authenticated using(true);
create policy "staff add" on resources for insert to authenticated with check(is_staff());
create policy "staff remove" on resources for delete to authenticated using(is_staff());
create policy "read" on messages for select to authenticated using(true);
create policy "send as yourself" on messages for insert to authenticated with check(user_id=auth.uid());

insert into storage.buckets(id,name,public) values('files','files',true);
create policy "staff upload" on storage.objects for insert to authenticated with check(bucket_id='files' and is_staff());
alter publication supabase_realtime add table messages, resources;

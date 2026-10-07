create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('Giữ nguyên', 'Cân nhắc tái phân bổ')),
  reason text not null check (char_length(btrim(reason)) between 8 and 2000),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) <= 49152),
  created_at timestamptz not null default now()
);
create index decisions_owner_created_idx on public.decisions (user_id, created_at desc);
alter table public.decisions enable row level security;
revoke all on public.decisions from public, anon, authenticated;
grant select, insert, delete on public.decisions to authenticated;
create policy decisions_read_own on public.decisions for select to authenticated
  using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));
create policy decisions_insert_own on public.decisions for insert to authenticated
  with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));
create policy decisions_delete_own on public.decisions for delete to authenticated
  using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));

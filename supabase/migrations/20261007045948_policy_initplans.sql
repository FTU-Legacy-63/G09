alter policy decisions_read_own on public.decisions using ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false));
alter policy decisions_insert_own on public.decisions with check ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false));
alter policy decisions_delete_own on public.decisions using ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false));

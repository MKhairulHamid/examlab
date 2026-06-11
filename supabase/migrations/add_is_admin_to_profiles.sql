-- Add an is_admin flag to profiles so the client can decide whether to surface
-- the Admin navigation link. This is a UI hint only — actual admin authorization
-- is still enforced server-side by the admin-api edge function (ADMIN_EMAIL), so
-- a user toggling this flag on their own row only reveals a link that returns
-- "Access Denied" on use.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

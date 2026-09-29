-- join_class(text) was an earlier, unapproved-access self-serve RPC that
-- predates the teacher-approval flow (approve_join_request). Any
-- authenticated pending user could call it directly via
-- /rest/v1/rpc/join_class and instantly become a student with any valid,
-- open join code, bypassing approval entirely. The frontend never called
-- it (it uses the join-class edge function + approve_join_request), so
-- dropping it is safe.
drop function if exists public.join_class(text);

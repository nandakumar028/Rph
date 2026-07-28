-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: Fix infinite-recursion RLS policies on profiles + organizations
--
-- Problem: The SELECT policy on `profiles` queries `profiles` itself in a
-- subquery, causing Postgres to evaluate the policy again → infinite loop
-- (error code 42P17).
--
-- Fix strategy:
--   1. Create a SECURITY DEFINER helper function `get_my_org_id()` that reads
--      the caller's org_id from profiles bypassing RLS (runs as the function
--      owner, not the row-level policy evaluator). This breaks the recursion.
--   2. Rewrite all self-referencing policies to use this function instead of
--      inline subqueries back to profiles.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── Helper function: returns the current user's org_id without going through RLS
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Grant execute to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — rewrite the recursive SELECT policy
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: self or org members can select" ON public.profiles;

CREATE POLICY "profiles: self or org members can select" ON public.profiles
    FOR SELECT
    USING (
        -- Own row: always readable
        id = auth.uid()
        -- Colleague in same org: use the helper to avoid re-evaluating this policy
        OR (org_id IS NOT NULL AND org_id = public.get_my_org_id())
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- organizations — rewrite the recursive policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org: members can select" ON public.organizations;
CREATE POLICY "org: members can select" ON public.organizations
    FOR SELECT
    USING (id = public.get_my_org_id());

DROP POLICY IF EXISTS "org: members can update" ON public.organizations;
CREATE POLICY "org: members can update" ON public.organizations
    FOR UPDATE
    USING (id = public.get_my_org_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- roles — rewrite the recursive policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "roles: members can select" ON public.roles;
CREATE POLICY "roles: members can select" ON public.roles
    FOR SELECT
    USING (org_id = public.get_my_org_id());

DROP POLICY IF EXISTS "roles: members can manage" ON public.roles;
CREATE POLICY "roles: members can manage" ON public.roles
    FOR ALL
    USING (org_id = public.get_my_org_id());

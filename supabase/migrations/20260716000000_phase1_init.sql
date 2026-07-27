-- ──────────────────────────────────────────────────────────────────────────────
-- Phase 1 Init — Rph Portal schema, RLS, and auth trigger
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ──────────────────────────────────────────────────────────────────────────────

-- ── Organizations ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.organizations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    subdomain  TEXT UNIQUE NOT NULL,
    plan_tier  TEXT DEFAULT 'free' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Members can view their own org
DROP POLICY IF EXISTS "org: members can select" ON public.organizations;
CREATE POLICY "org: members can select" ON public.organizations
    FOR SELECT
    USING (
        id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- Members can update their own org (fine‑grained role checks happen in app layer)
DROP POLICY IF EXISTS "org: members can update" ON public.organizations;
CREATE POLICY "org: members can update" ON public.organizations
    FOR UPDATE
    USING (
        id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- ── Roles ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Members can view roles within their org
DROP POLICY IF EXISTS "roles: members can select" ON public.roles;
CREATE POLICY "roles: members can select" ON public.roles
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- All operations on roles scoped to org members (add app‑layer admin check as needed)
DROP POLICY IF EXISTS "roles: members can manage" ON public.roles;
CREATE POLICY "roles: members can manage" ON public.roles
    FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- ── Profiles ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id     UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    email      TEXT UNIQUE NOT NULL,
    role_id    UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    status     TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: own row always readable (bootstraps new users before org is linked);
-- also allows viewing colleagues in the same org.
DROP POLICY IF EXISTS "profiles: self or org members can select" ON public.profiles;
CREATE POLICY "profiles: self or org members can select" ON public.profiles
    FOR SELECT
    USING (
        id = auth.uid()
        OR org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- INSERT: the handle_new_user trigger runs as SECURITY DEFINER so it bypasses
-- RLS. This policy is still needed for any future direct‑insert flows.
DROP POLICY IF EXISTS "profiles: self can insert" ON public.profiles;
CREATE POLICY "profiles: self can insert" ON public.profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- UPDATE: users can only update their own row
DROP POLICY IF EXISTS "profiles: self can update" ON public.profiles;
CREATE POLICY "profiles: self can update" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid());

-- ── New‑user trigger ──────────────────────────────────────────────────────────
-- Runs after each INSERT into auth.users.
-- Creates a personal org and a profiles row automatically.
-- Runs as SECURITY DEFINER so it bypasses RLS.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id      UUID;
    v_full_name   TEXT;
    v_safe_name   TEXT;
    v_subdomain   TEXT;
BEGIN
    -- Derive display name from metadata or email prefix
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        split_part(new.email, '@', 1)
    );

    -- Build a URL‑safe subdomain: strip non‑alphanumeric, append random suffix
    v_safe_name := lower(regexp_replace(v_full_name, '[^a-zA-Z0-9]', '', 'g'));
    IF v_safe_name = '' THEN
        v_safe_name := 'org';
    END IF;
    v_subdomain := v_safe_name || '-' || floor(random() * 90000 + 10000)::text;

    -- Create the personal organisation
    INSERT INTO public.organizations (name, subdomain)
    VALUES (v_full_name || '''s Org', v_subdomain)
    RETURNING id INTO v_org_id;

    -- Create the profile row linked to that org
    INSERT INTO public.profiles (id, email, org_id, status)
    VALUES (new.id, new.email, v_org_id, 'active');

    RETURN new;
END;
$$;

-- Drop and recreate the trigger to pick up any function changes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── updated_at helper (optional but recommended) ──────────────────────────────
-- Keeps updated_at columns in sync automatically.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    new.updated_at := now();
    RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

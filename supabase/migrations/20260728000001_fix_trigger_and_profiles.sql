-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: Fix trigger collision safety + add full_name to profiles
-- Sprint 1 — Bug fixes: subdomain uniqueness retry + proper error surfacing
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Add full_name column to profiles (idempotent) ──────────────────────────
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS full_name TEXT;

-- ── 2. Rebuild handle_new_user with collision-safe subdomain ──────────────────
--
-- Fixes:
--   a) Retry loop (up to 5 attempts) with a longer hex random suffix to avoid
--      unique-constraint violations on `organizations.subdomain`.
--   b) Stores full_name in `profiles` so the app can read it without joining
--      auth.users (which is blocked by RLS for anon/user roles).
--   c) EXCEPTION handler catches any remaining errors and RE-RAISEs with a
--      descriptive message — preventing the silent rollback that caused `{}`.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id       UUID;
    v_full_name    TEXT;
    v_safe_name    TEXT;
    v_subdomain    TEXT;
    v_attempt      INT := 0;
    v_max_attempts INT := 5;
    v_inserted     BOOLEAN := FALSE;
BEGIN
    -- ── Derive display name ──────────────────────────────────────────────────
    v_full_name := COALESCE(
        NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
        split_part(new.email, '@', 1)
    );

    -- ── Build URL‑safe base ──────────────────────────────────────────────────
    v_safe_name := lower(regexp_replace(v_full_name, '[^a-zA-Z0-9]', '', 'g'));
    IF v_safe_name = '' THEN
        v_safe_name := 'org';
    END IF;

    -- ── Retry loop: generate subdomain until no collision ────────────────────
    -- Uses a 8-char hex random suffix (~4 billion values) instead of 5 digits
    -- (~90 000) to make collision probability negligible.
    WHILE v_attempt < v_max_attempts AND NOT v_inserted LOOP
        v_attempt   := v_attempt + 1;
        v_subdomain := v_safe_name || '-' || lpad(to_hex(floor(random() * 4294967295)::bigint), 8, '0');

        BEGIN
            INSERT INTO public.organizations (name, subdomain)
            VALUES (v_full_name || '''s Org', v_subdomain)
            RETURNING id INTO v_org_id;

            v_inserted := TRUE;

        EXCEPTION
            WHEN unique_violation THEN
                -- subdomain collision — try again on next iteration
                NULL;
        END;
    END LOOP;

    -- ── Guard: all retries exhausted ─────────────────────────────────────────
    IF NOT v_inserted THEN
        RAISE EXCEPTION
            'handle_new_user: could not generate unique subdomain for "%" after % attempts',
            v_safe_name, v_max_attempts;
    END IF;

    -- ── Create profile row, storing full_name ────────────────────────────────
    INSERT INTO public.profiles (id, email, full_name, org_id, status)
    VALUES (new.id, new.email, v_full_name, v_org_id, 'active')
    ON CONFLICT (id) DO UPDATE
        SET
            email     = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            org_id    = EXCLUDED.org_id,
            status    = EXCLUDED.status;

    RETURN new;

EXCEPTION
    WHEN OTHERS THEN
        -- Surface the real error message to Supabase / the client instead of
        -- rolling back silently and returning an empty {} error object.
        RAISE EXCEPTION 'handle_new_user failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Drop and recreate the trigger to pick up the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CRM Module Tables — Phase 2
-- ============================================================

-- Helper function: get caller's org_id from their profile
CREATE OR REPLACE FUNCTION public.get_caller_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    owner_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    email       TEXT,
    phone       TEXT,
    status      TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','qualified','unqualified','converted')),
    source      TEXT DEFAULT 'manual'
                    CHECK (source IN ('manual','website','referral','social','campaign','import')),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_leads" ON public.leads
    FOR SELECT USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_insert_leads" ON public.leads
    FOR INSERT WITH CHECK (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_update_leads" ON public.leads
    FOR UPDATE USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_delete_leads" ON public.leads
    FOR DELETE USING (org_id = public.get_caller_org_id());

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    industry    TEXT,
    website     TEXT,
    phone       TEXT,
    address     TEXT,
    city        TEXT,
    country     TEXT,
    size        TEXT DEFAULT 'unknown'
                    CHECK (size IN ('1-10','11-50','51-200','201-500','501+','unknown')),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_companies" ON public.companies
    FOR SELECT USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_insert_companies" ON public.companies
    FOR INSERT WITH CHECK (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_update_companies" ON public.companies
    FOR UPDATE USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_delete_companies" ON public.companies
    FOR DELETE USING (org_id = public.get_caller_org_id());

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id     UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    company_id  UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    first_name  TEXT NOT NULL,
    last_name   TEXT,
    email       TEXT,
    phone       TEXT,
    job_title   TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_contacts" ON public.contacts
    FOR SELECT USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_insert_contacts" ON public.contacts
    FOR INSERT WITH CHECK (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_update_contacts" ON public.contacts
    FOR UPDATE USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_delete_contacts" ON public.contacts
    FOR DELETE USING (org_id = public.get_caller_org_id());

-- ============================================================
-- DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deals (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id       UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    owner_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    contact_id   UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    company_id   UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    title        TEXT NOT NULL,
    amount       NUMERIC(18,2) DEFAULT 0,
    currency     TEXT DEFAULT 'USD',
    stage        TEXT NOT NULL DEFAULT 'prospecting'
                     CHECK (stage IN ('prospecting','qualification','proposal','negotiation','closed_won','closed_lost')),
    close_date   DATE,
    probability  INTEGER DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_deals" ON public.deals
    FOR SELECT USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_insert_deals" ON public.deals
    FOR INSERT WITH CHECK (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_update_deals" ON public.deals
    FOR UPDATE USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_delete_deals" ON public.deals
    FOR DELETE USING (org_id = public.get_caller_org_id());

-- ============================================================
-- TICKETS (Support)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tickets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id       UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    owner_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    contact_id   UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    subject      TEXT NOT NULL,
    description  TEXT,
    status       TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open','in_progress','waiting','resolved','closed')),
    priority     TEXT NOT NULL DEFAULT 'medium'
                     CHECK (priority IN ('low','medium','high','urgent')),
    resolved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_tickets" ON public.tickets
    FOR SELECT USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_insert_tickets" ON public.tickets
    FOR INSERT WITH CHECK (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_update_tickets" ON public.tickets
    FOR UPDATE USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_delete_tickets" ON public.tickets
    FOR DELETE USING (org_id = public.get_caller_org_id());

-- ============================================================
-- ACTIVITIES (Audit / Timeline log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entity_type   TEXT NOT NULL CHECK (entity_type IN ('lead','contact','company','deal','ticket')),
    entity_id     UUID NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('created','updated','deleted','note','email','call','meeting')),
    payload       JSONB DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_activities" ON public.activities
    FOR SELECT USING (org_id = public.get_caller_org_id());

CREATE POLICY "org_members_insert_activities" ON public.activities
    FOR INSERT WITH CHECK (org_id = public.get_caller_org_id());

-- ============================================================
-- updated_at auto-refresh trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_deals_updated_at
    BEFORE UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

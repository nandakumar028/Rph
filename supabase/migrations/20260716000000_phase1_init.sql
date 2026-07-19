-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    plan_tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table (maps to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Define RLS policies

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON public.organizations
    FOR SELECT
    USING (
        id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Owners and Admins can update their organization" ON public.organizations
    FOR UPDATE
    USING (
        id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- Roles policies
CREATE POLICY "Users can view roles in their organization" ON public.roles
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage roles in their organization" ON public.roles
    FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- Profiles policies
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE profiles.id = auth.uid()
        )
        OR id = auth.uid()
    );

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    USING (
        id = auth.uid()
    );

-- Profile trigger on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, status)
    VALUES (new.id, new.email, 'active');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCompanies, createCompany, getUserProfile } from '@/utils/supabase/queries'

// GET /api/companies
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)

  const opts = {
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
  }

  const companies = await getCompanies(supabase, opts)
  if (!companies) return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  return NextResponse.json({ data: companies, count: companies.length })
}

// POST /api/companies
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, industry, website, phone, address, city, country, size, notes } = body

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const company = await createCompany(supabase, {
    org_id: profile.org_id,
    name,
    industry,
    website,
    phone,
    address,
    city,
    country,
    size,
    notes,
  })

  if (!company) return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  return NextResponse.json({ data: company }, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getDeals, createDeal, getUserProfile } from '@/utils/supabase/queries'

// GET /api/deals
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const opts = {
    stage: searchParams.get('stage') ?? undefined,
    owner_id: searchParams.get('owner_id') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
  }

  const deals = await getDeals(supabase, opts)
  if (!deals) return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  return NextResponse.json({ data: deals, count: deals.length })
}

// POST /api/deals
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, amount, currency, stage, close_date, probability, contact_id, company_id, owner_id, notes } = body

  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const deal = await createDeal(supabase, {
    org_id: profile.org_id,
    title,
    amount,
    currency,
    stage,
    close_date,
    probability,
    contact_id,
    company_id,
    owner_id: owner_id ?? profile.id,
    notes,
  })

  if (!deal) return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  return NextResponse.json({ data: deal }, { status: 201 })
}

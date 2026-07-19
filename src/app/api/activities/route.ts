import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getActivities, logActivity, getUserProfile } from '@/utils/supabase/queries'

// GET /api/activities?entity_type=lead&entity_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)

  const entity_type = searchParams.get('entity_type')
  const entity_id = searchParams.get('entity_id')

  if (!entity_type || !entity_id) {
    return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 })
  }

  const activities = await getActivities(supabase, entity_type, entity_id)
  if (!activities) return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  return NextResponse.json({ data: activities, count: activities.length })
}

// POST /api/activities — manual activity log (e.g., call notes, meeting logs)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const profile = await getUserProfile(supabase)
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { entity_type, entity_id, activity_type, payload } = body

  if (!entity_type || !entity_id || !activity_type) {
    return NextResponse.json({ error: 'entity_type, entity_id, and activity_type are required' }, { status: 400 })
  }

  await logActivity(supabase, {
    org_id: profile.org_id,
    actor_id: profile.id,
    entity_type,
    entity_id,
    activity_type,
    payload,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}

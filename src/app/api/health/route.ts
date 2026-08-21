import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getDb } from '@/infrastructure/db/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await getDb().execute(sql`select 1`)
    return NextResponse.json({ status: 'ok', database: 'up' })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', database: 'down', message: (error as Error).message },
      { status: 503 },
    )
  }
}

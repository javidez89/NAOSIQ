import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { publicSupabaseEnv } from '@/lib/env';
import { logUnexpected } from '@/lib/logger';
import type { Database } from '@/types/database.generated';

const expectedSchema = '20260921193819';

function hasReadinessAccess(request: NextRequest): boolean {
  const expected = process.env.READINESS_TOKEN ?? '';
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (expected.length < 32 || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function GET(request: NextRequest) {
  if (!hasReadinessAccess(request)) {
    return NextResponse.json({ error: 'No disponible' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const { url, key } = publicSupabaseEnv();
    const db = createClient<Database>(url, key, {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    });
    const { data, error } = await db.rpc('system_readiness');
    if (error || data !== expectedSchema) throw error ?? new Error('Unexpected schema marker');
    return NextResponse.json(
      { status: 'ready', service: 'crm-techi', database: 'ready', schema: expectedSchema },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    const correlationId = logUnexpected('readiness.database.failed', error);
    return NextResponse.json(
      { status: 'not_ready', service: 'crm-techi', correlationId },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}

import { NextResponse } from 'next/server';
// Liveness only: this is not a database readiness or security certification endpoint.
export async function GET() { return NextResponse.json({ status: 'ok', service: 'crm-techi', version: '0.1.0' }, { headers: { 'Cache-Control': 'no-store' } }); }

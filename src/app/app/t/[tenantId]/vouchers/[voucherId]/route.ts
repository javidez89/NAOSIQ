import { NextResponse, type NextRequest } from 'next/server';
import { tenantContext } from '@/lib/access';
import { uuid } from '@/domain/validation';
import { createVoucherPdf } from '@/lib/voucher-pdf';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: { params: Promise<{ tenantId: string; voucherId: string }> }) {
  const p = await params;
  const { db, tenantId } = await tenantContext(p.tenantId);
  const id = uuid(p.voucherId);
  const { data, error } = await db.from('vouchers').select('id,kind,snapshot').eq('tenant_id', tenantId).eq('id', id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'Comprobante no disponible.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  if (!data.snapshot || typeof data.snapshot !== 'object' || Array.isArray(data.snapshot)) {
    return NextResponse.json({ error: 'Comprobante no disponible.' }, { status: 500 });
  }
  const format = request.nextUrl.searchParams.get('format') === '80mm' ? '80mm' : 'a4';
  const bytes = await createVoucherPdf({ ...data, snapshot: data.snapshot }, format);
  return new Response(bytes, { headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${request.nextUrl.searchParams.get('download') === '1' ? 'attachment' : 'inline'}; filename="comprobante-${format === 'a4' ? id : `80mm-${id}`}.pdf"`,
    'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
  }});
}

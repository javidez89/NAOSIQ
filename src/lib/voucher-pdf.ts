import 'server-only';
import { brand } from '@/config/brand';
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type RGB } from 'pdf-lib';
import { formatMoney } from '@/domain/money';

const ink = rgb(11 / 255, 15 / 255, 26 / 255);
const muted = rgb(75 / 255, 85 / 255, 99 / 255);
const violet = rgb(124 / 255, 58 / 255, 237 / 255);
const surface = rgb(247 / 255, 247 / 255, 251 / 255);

/** Immutable stored snapshot in; no arbitrary HTML, URL fetches or filesystem access. */
export async function createVoucherPdf(voucher: { id: string; kind: string; snapshot: Record<string, unknown> }, format: 'a4' | '80mm' = 'a4') {
  const pageWidth = format === '80mm' ? 226.77 : 595.28;
  const pageHeight = format === '80mm' ? 680 : 841.89;
  const margin = format === '80mm' ? 20 : 48;
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let replaced = false;
  const clean = (value: unknown, font: PDFFont = regular) => Array.from(String(value ?? '')).map(char => {
    if (/\s/.test(char)) return char === '\n' ? '\n' : ' ';
    try { font.encodeText(char); return char; } catch { replaced = true; return '?'; }
  }).join('');
  const business = clean(voucher.snapshot.business ?? 'Comercio');
  const isIntake = voucher.kind === 'intake';
  const documentTitle = isIntake ? 'Comprobante de recepción' : 'Comprobante de pago';
  let page: PDFPage;
  let y: number;

  function drawHeader(nextPage = false) {
    page = doc.addPage([pageWidth, pageHeight]);
    page.drawRectangle({ x: 0, y: pageHeight - 112, width: pageWidth, height: 112, color: ink });
    page.drawRectangle({ x: 0, y: pageHeight - 116, width: pageWidth, height: 4, color: violet });
    page.drawText(business, { x: margin, y: pageHeight - 62, font: bold, size: format === '80mm' ? 15 : 22, color: rgb(1, 1, 1), maxWidth: pageWidth - margin * 2 });
    page.drawText(clean(brand.endorsement), { x: margin, y: pageHeight - 85, font: regular, size: 9, color: rgb(.84, .82, .9) });
    if (nextPage) page.drawText('CONTINUACIÓN', { x: pageWidth - 132, y: pageHeight - 84, font: bold, size: 8, color: rgb(.84, .82, .9) });
    y = pageHeight - 154;
  }
  function ensureSpace(height = 36) {
    if (y - height < 64) drawHeader(true);
  }
  function rule() {
    ensureSpace(18);
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(.86, .87, .9) });
    y -= 18;
  }
  function wrappedLines(value: unknown, font: PDFFont, size: number, maxWidth = pageWidth - margin * 2) {
    const lines: string[] = [];
    for (const raw of clean(value, font).split('\n')) {
      let current = '';
      for (const char of raw) {
        if (current && font.widthOfTextAtSize(current + char, size) > maxWidth) {
          lines.push(current.trimEnd());
          current = '';
        }
        current += char;
      }
      lines.push(current || ' ');
    }
    return lines;
  }
  function paragraph(value: unknown, options: { size?: number; font?: PDFFont; color?: RGB; gap?: number } = {}) {
    const size = options.size ?? 11;
    const font = options.font ?? regular;
    for (const line of wrappedLines(value, font, size)) {
      ensureSpace(size + 8);
      page.drawText(line, { x: margin, y, font, size, color: options.color ?? ink });
      y -= size + 7;
    }
    y -= options.gap ?? 5;
  }
  function field(label: string, value: unknown) {
    ensureSpace(38);
    page.drawText(clean(label).toUpperCase(), { x: margin, y, font: bold, size: 8, color: violet });
    y -= 16;
    paragraph(value, { size: 11, gap: 7 });
  }
  function highlight(label: string, value: string) {
    ensureSpace(72);
    page.drawRectangle({ x: margin, y: y - 48, width: pageWidth - margin * 2, height: 62, color: surface, borderColor: rgb(.88, .86, .94), borderWidth: 1 });
    page.drawText(clean(label).toUpperCase(), { x: margin + 16, y: y - 6, font: bold, size: 8, color: violet });
    page.drawText(clean(value), { x: margin + 16, y: y - 32, font: bold, size: 17, color: ink });
    y -= 76;
  }

  doc.setTitle(documentTitle);
  doc.setSubject(`${documentTitle} emitido por ${business}`);
  doc.setAuthor(business);
  doc.setCreator(brand.name);
  doc.setProducer(`${brand.name} local 0.1.0`);
  doc.setKeywords(['comprobante', 'servicio técnico', business, brand.name]);
  drawHeader();

  paragraph(documentTitle.toUpperCase(), { size: 17, font: bold, gap: 2 });
  paragraph(`Emisor: ${business}`, { size: 10, color: muted, gap: 12 });
  field('Comprobante', voucher.id);
  field('Orden de trabajo', voucher.snapshot.repair_id);
  field('Fecha de emisión', voucher.snapshot.issued_at);
  rule();

  if (isIntake) {
    paragraph('Recibido para diagnóstico/reparación.', { size: 13, font: bold, gap: 12 });
    field('Cliente', voucher.snapshot.customer);
    field('Equipo u objeto', voucher.snapshot.device);
    field('Falla reportada', voucher.snapshot.issue);
    if (voucher.snapshot.intake_event_id) {
      field('Estado físico', voucher.snapshot.physical_condition);
      field('Accesorios recibidos', voucher.snapshot.accessories);
      field('Recibido por', voucher.snapshot.received_by);
      field('Evento de recepción', voucher.snapshot.intake_event_id);
    } else {
      paragraph('Documento del flujo anterior: no acredita una recepción física confirmada.', { size: 10, font: bold, color: muted });
    }
  } else {
    highlight('Movimiento confirmado', formatMoney(Number(voucher.snapshot.amount_minor)));
    field('Medio registrado', voucher.snapshot.method);
    field('Referencia del pago', voucher.snapshot.payment_id);
    paragraph(`Los medios de pago y la confirmación de este movimiento pertenecen a ${business}.`, { size: 10, color: muted });
    paragraph('Este comprobante corresponde únicamente al movimiento confirmado indicado. No acredita entrega del equipo ni define un saldo por cobrar.', { size: 10, color: muted });
  }

  rule();
  paragraph('Documento operativo. No sustituye una factura electrónica ni acredita certificación fiscal o bancaria.', { size: 9, color: muted });
  if (replaced) paragraph('Se reemplazaron caracteres no compatibles por ?. Consulte el registro original. Soporte tipográfico multilingüe pendiente.', { size: 9, color: muted });
  const pages = doc.getPages();
  pages.forEach((item, index) => {
    item.drawText(`${documentTitle} · ${index + 1} / ${pages.length}`, { x: margin, y: 31, size: 8, font: regular, color: muted });
    item.drawText(brand.name, { x: pageWidth - margin - bold.widthOfTextAtSize(brand.name, 8), y: 31, size: 8, font: bold, color: violet });
  });
  return new Uint8Array(await doc.save());
}

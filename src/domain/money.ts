import { DomainError } from './errors';
export const MAX_MINOR = 999_999_999_999;
/** All arithmetic is integer cents; never parse payment amounts with parseFloat. */
export function parseMoney(input:string):number {
  if (!/^(0|[1-9]\d{0,9})(\.\d{1,2})?$/.test(input)) throw new DomainError('VALIDATION','Importe inválido. Usa punto decimal y sin separadores de miles.');
  const [whole='0',fraction=''] = input.split('.');
  const result = Number(whole)*100 + Number(fraction.padEnd(2,'0'));
  return assertMinor(result);
}
export function assertMinor(value:number):number {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_MINOR) throw new DomainError('VALIDATION','Importe fuera de rango.');
  return value;
}
export function sumMinor(values:readonly number[]):number {
  return values.reduce((total,n)=>assertMinor(total+assertMinor(n)),0);
}
export function formatMoney(minor:number,currency='COP'):string {
  return new Intl.NumberFormat('es-CO',{style:'currency',currency,minimumFractionDigits:2}).format(assertMinor(minor)/100);
}

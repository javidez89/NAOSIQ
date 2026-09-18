import { DomainError } from './errors';
import { uuid } from './validation';
export function objectPath(tenantId:string,repairId:string,objectId:string,extension:'jpg'|'png'|'webp'|'pdf'):string {
  if (!['jpg','png','webp','pdf'].includes(extension)) throw new DomainError('VALIDATION','Formato no permitido.');
  return `${uuid(tenantId)}/${uuid(repairId)}/${uuid(objectId)}.${extension}`;
}
export function validUpload(mime:string,bytes:number):boolean {
  return ['image/jpeg','image/png','image/webp','application/pdf'].includes(mime) && Number.isSafeInteger(bytes) && bytes>0 && bytes<=5*1024*1024;
}

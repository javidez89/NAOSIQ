'use client';

import { useActionState, useState } from 'react';
import type { FormState } from '@/components/action-form';
import { initialState } from '@/components/action-form';

type EquipmentOption = {
  id: string;
  label: string;
};

export function CustomerRequestWizard({
  action,
  equipment,
  customerName,
  customerPhone,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  equipment: EquipmentOption[];
  customerName: string;
  customerPhone: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [step, setStep] = useState(1);
  const [equipmentId, setEquipmentId] = useState('');
  const [device, setDevice] = useState('');
  const [issue, setIssue] = useState('');
  const equipmentReady = Boolean(equipmentId) || device.trim().length >= 2;
  const issueReady = issue.trim().length >= 5;

  return <form action={formAction} className="stack" aria-busy={pending}>
    <nav className="actions" aria-label="Pasos de la solicitud">
      <button type="button" className={step === 1 ? '' : 'secondary'} onClick={() => setStep(1)}>1. Equipo</button>
      <button type="button" className={step === 2 ? '' : 'secondary'} disabled={!equipmentReady} onClick={() => setStep(2)}>2. Falla</button>
      <button type="button" className={step === 3 ? '' : 'secondary'} disabled={!equipmentReady || !issueReady} onClick={() => setStep(3)}>3. Revisión</button>
    </nav>

    <section className="panel" data-screen-id="CL03" hidden={step !== 1}>
      <p className="eyebrow">CL03 · Equipo</p>
      <h2>¿Qué equipo necesita atención?</h2>
      {equipment.length > 0 && <label>Usar un equipo guardado
        <select
          name="equipmentId"
          value={equipmentId}
          onChange={(event) => setEquipmentId(event.target.value)}
          data-action-id="CL03.A2"
        >
          <option value="">Registrar otro equipo en esta solicitud</option>
          {equipment.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>}
      <label>Equipo, marca y modelo
        <input
          name="device"
          value={device}
          onChange={(event) => setDevice(event.target.value)}
          required={!equipmentId}
          disabled={Boolean(equipmentId)}
          minLength={2}
          maxLength={160}
          placeholder="Ej. Portátil Lenovo IdeaPad 3"
        />
      </label>
      <div className="actions">
        <button type="button" data-action-id="CL03.A1" disabled={!equipmentReady} onClick={() => setStep(2)}>Continuar a la falla</button>
      </div>
      <p className="muted">El borrador local permanece desactivado mientras D05 siga pendiente.</p>
    </section>

    <section className="panel" data-screen-id="CL04" hidden={step !== 2}>
      <p className="eyebrow">CL04 · Falla y evidencias</p>
      <h2>Cuéntanos qué sucede</h2>
      <label>Descripción de la falla
        <textarea name="issue" value={issue} onChange={(event) => setIssue(event.target.value)} required minLength={5} maxLength={2000} placeholder="Síntomas, cuándo comenzó y condiciones relevantes"/>
      </label>
      <p className="notice warning">Las fotos privadas requieren D09 y el servicio Storage; la solicitud puede continuar sin afirmar que se cargó evidencia.</p>
      <div className="actions">
        <button type="button" className="secondary" data-action-id="CL04.A3" onClick={() => setStep(1)}>Volver al equipo</button>
        <button type="button" data-action-id="CL04.A2" disabled={!issueReady} onClick={() => setStep(3)}>Continuar a contacto</button>
      </div>
    </section>

    <section className="panel" data-screen-id="CL05" hidden={step !== 3}>
      <p className="eyebrow">CL05 · Contacto y revisión</p>
      <h2>Confirma tu solicitud</h2>
      <dl>
        <div><dt>Cliente</dt><dd>{customerName || 'Perfil del cliente'}</dd></div>
        <div><dt>Contacto</dt><dd>{customerPhone || 'Sin teléfono registrado'}</dd></div>
      </dl>
      <p>El comercio revisará la información y coordinará la recepción. Sólo después de confirmar custodia se emitirá el voucher de recepción.</p>
      <div className="actions">
        <button type="button" className="secondary" data-action-id="CL05.A1" onClick={() => setStep(1)}>Revisar equipo</button>
        <button type="submit" data-action-id="CL05.A2" disabled={pending} aria-disabled={pending}>{pending ? 'Creando solicitud…' : 'Crear solicitud'}</button>
      </div>
      <p className="muted">Si sales sin enviar, el sistema indicará que el borrador no quedó guardado.</p>
    </section>

    {pending && <span className="sr-only" role="status">Procesando la solicitud.</span>}
    {state.message && <p role={state.ok ? 'status' : 'alert'} className={`notice ${state.ok ? 'success' : 'error'}`}>{state.message}</p>}
  </form>;
}

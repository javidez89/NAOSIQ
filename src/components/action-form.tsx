'use client';
import { useActionState } from 'react';
export type FormState = { message: string; ok: boolean };
export const initialState: FormState = { message: '', ok: false };
export function ActionForm({ action, children, submit, actionId }: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: React.ReactNode; submit: string; actionId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="stack" aria-busy={pending} data-action-id={actionId}>
    {children}<button type="submit" disabled={pending} aria-disabled={pending}>{pending ? 'Procesando…' : submit}</button>
    {pending && <span className="sr-only" role="status">Procesando la solicitud.</span>}
    {state.message && <p role={state.ok ? 'status' : 'alert'} className={`notice ${state.ok ? 'success' : 'error'}`}>{state.message}</p>}
  </form>;
}

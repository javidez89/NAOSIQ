'use client';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="panel"><h1>No pudimos completar la solicitud</h1><p>No pudimos verificar el resultado. Consulte el estado de la operación antes de reintentar para evitar duplicados.</p><button onClick={reset}>Volver a intentar</button></section>;
}

export const masterContextCookie = 'naosiq_master_context';

export const masterSections = {
  plans: { id: 'SU06', title: 'Planes', description: 'Planes versionados; precios y límites siguen pendientes de aprobación.' },
  subscriptions: { id: 'SU07', title: 'Suscripciones', description: 'Ciclos SaaS separados de los pagos de reparaciones.' },
  billing: { id: 'SU08', title: 'Facturación y pagos SaaS', description: 'Conciliación SaaS; no modifica pagos de clientes.' },
  domains: { id: 'SU09', title: 'URLs y dominios', description: 'Consulta de direcciones; cambios y verificación se implementan en P05.' },
  users: { id: 'SU10', title: 'Usuarios globales', description: 'Identidades e invitaciones separadas de sus membresías.' },
  integrations: { id: 'SU11', title: 'Integraciones globales', description: 'Adaptadores externos desactivados y sin secretos en la interfaz.' },
  whatsapp: { id: 'SU12', title: 'WhatsApp global', description: 'La apertura de un enlace no acredita envío ni lectura.' },
  audit: { id: 'SU13', title: 'Auditoría global', description: 'Historial inmutable con actor real y contexto.' },
  support: { id: 'SU14', title: 'Soporte e incidentes', description: 'Mensajería real y cierre de casos aún no implementados.' },
  settings: { id: 'SU15', title: 'Configuración global', description: 'Las políticas numéricas abiertas no se publican por inferencia.' },
  analytics: { id: 'SU20', title: 'Analítica y exportaciones SaaS', description: 'Lecturas locales disponibles; exportaciones asíncronas aún no.' },
} as const;

export type MasterSection = keyof typeof masterSections;

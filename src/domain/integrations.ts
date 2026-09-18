/** Contracts only. No provider adapter is enabled by default. */
export interface NotificationRequest {
  tenantId: string; repairId: string; templateCode: string; recipientRef: string; idempotencyKey: string;
}
export interface NotificationPort {
  send(request: NotificationRequest): Promise<{ providerMessageId: string; status: 'accepted' }>;
}
export interface VerifiedPaymentEvent {
  providerEventId: string; merchantAccountId: string; paymentReference: string;
  amountMinor: number; currency: string; status: 'approved' | 'declined' | 'pending';
}
export interface PaymentGatewayPort {
  verifyWebhook(rawBody: Uint8Array, headers: Readonly<Record<string, string>>): Promise<VerifiedPaymentEvent>;
}
export class IntegrationNotConfigured extends Error {
  constructor() { super('Integration is not configured. No message was sent and no payment was confirmed.'); }
}
export class DisabledNotificationAdapter implements NotificationPort {
  async send(_request: NotificationRequest): Promise<{ providerMessageId: string; status: 'accepted' }> {
    throw new IntegrationNotConfigured();
  }
}

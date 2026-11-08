// web-push no trae tipos y @types/web-push no está autorizado en AGENTS.md.
// Declaración mínima de lo que usamos. Solo servidor.
declare module "web-push" {
  export interface PushSubscriptionJSON {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }
  export interface WebPushError extends Error {
    statusCode: number;
  }
  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  export function sendNotification(
    subscription: PushSubscriptionJSON,
    payload: string,
    options?: { TTL?: number }
  ): Promise<unknown>;
}

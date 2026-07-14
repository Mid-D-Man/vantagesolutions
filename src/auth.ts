import type { Env } from './types';

const SESSION_COOKIE = 'vs_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Sessions are stateless: a base64url JSON payload + HMAC signature, both signed with
 * SESSION_SECRET. No sessions table, nothing to garbage-collect — the token is just
 * verified fresh on every request.
 */
export async function createSessionToken(username: string, secret: string): Promise<string> {
  const payload = JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_SECONDS * 1000 });
  const payloadBytes = new TextEncoder().encode(payload);
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, payloadBytes);
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [payloadPart, sigPart] = token.split('.');
  if (!payloadPart || !sigPart) return false;

  try {
    const payloadBytes = base64UrlDecode(payloadPart);
    const key = await hmacKey(secret);
    const valid = await crypto.subtle.verify('HMAC', key, base64UrlDecode(sigPart), payloadBytes);
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { u: string; exp: number };
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('Cookie');
  if (!header) return undefined;
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  const token = getCookie(request, SESSION_COOKIE);
  return verifySessionToken(token, env.SESSION_SECRET);
}

/**
 * Plain `===` on secrets leaks timing information (string comparison usually short-circuits
 * on the first mismatched byte). This walks the whole string regardless of where it diverges.
 * Not a substitute for real rate-limiting, but removes the cheapest timing side-channel.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };

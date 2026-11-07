import { API, initAuth } from './auth';

export type Mode = 'research' | 'drafting';
export type Profile = { id: string; email: string; name: string; verified: boolean;
  prompts_left: number; free_allowance: number; preferences: { theme: 'light' | 'dark' | 'system' } };
export type Conversation = { id: string; title: string; mode: Mode };
export type Citation = { source_url: string; citation_text: string; as_at_date: string };
export type Message = { id: string; role: 'user' | 'assistant'; content: string;
  status: 'complete' | 'incomplete' | 'blocked'; citations: Citation[] };
export type Legal = { document: 'terms' | 'privacy'; version: string; text: string;
  consent_label: string; is_fake: boolean };
export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message); }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  initAuth();
  const response = await fetch(API + '/v1' + path, { ...options, credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (!response.ok) {
    const value = await response.json().catch(() => null);
    throw new ApiError(value?.error?.code || 'internal', value?.error?.message || 'Request unavailable.', response.status);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
export type StreamEvent = { event: string; data: Record<string, unknown> | Citation[] };
export async function streamReply(id: string, content: string, mode: Mode, signal: AbortSignal,
  receive: (event: StreamEvent) => void) {
  initAuth();
  const response = await fetch(API + '/v1/conversations/' + id + '/messages', {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, mode }), signal,
  });
  if (!response.ok) {
    const value = await response.json();
    throw new ApiError(value.error?.code || 'internal', value.error?.message || 'Response unavailable.', response.status);
  }
  if (!response.body) throw new Error('Streaming unavailable.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n');
      let end: number;
      while ((end = pending.indexOf('\n\n')) >= 0) {
        const frame = pending.slice(0, end); pending = pending.slice(end + 2);
        const event = frame.split('\n').find(line => line.startsWith('event:'))?.slice(6).trim();
        const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
        if (event && data) receive({ event, data: JSON.parse(data) });
      }
      if (done) break;
    }
  } finally { reader.releaseLock(); }
}

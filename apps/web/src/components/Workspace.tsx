'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { api, ApiError, Citation, Conversation, Message, Mode, Profile, streamReply } from '@/lib/api';
import { initAuth, Session } from '@/lib/auth';
import { Icon } from './Icon';

export function Workspace() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null); const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]); const [current, setCurrent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); const [mode, setMode] = useState<Mode>('research');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [text, setText] = useState(''); const [error, setError] = useState(''); const [streaming, setStreaming] = useState(false);
  const [collapsed, setCollapsed] = useState(false); const [menu, setMenu] = useState(false);
  const abort = useRef<AbortController | null>(null); const bottom = useRef<HTMLDivElement>(null);
  async function refresh() { const me = await api<Profile>('/me'); setProfile(me); return me; }
  async function list() { const page = await api<{ items: Conversation[]; next_cursor: string | null }>('/conversations'); setConversations(page.items); setNextCursor(page.next_cursor); }
  async function more() { if (!nextCursor) return; const page = await api<{ items: Conversation[]; next_cursor: string | null }>('/conversations?cursor=' + nextCursor); setConversations(items => [...items, ...page.items]); setNextCursor(page.next_cursor); }
  useEffect(() => {
    initAuth();
    Session.doesSessionExist().then(async exists => { if (exists) { await refresh(); await list(); } })
      .catch(() => setError('Unable to load your workspace.')).finally(() => setLoading(false));
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (profile) { const theme = profile.preferences.theme; document.documentElement.dataset.theme = theme; localStorage.setItem('civis-theme', theme); } }, [profile]);
  async function open(id: string) {
    if (streaming) return; setError('');
    try { const item = await api<Conversation & { messages: Message[] }>('/conversations/' + id); setCurrent(id); setMode(item.mode); setMessages(item.messages); }
    catch { setError('Unable to open this conversation.'); }
  }
  async function remove(id: string) {
    if (!confirm('Delete this conversation?')) return;
    try { await api('/conversations/' + id, { method: 'DELETE' }); if (current === id) { setCurrent(null); setMessages([]); } await list(); }
    catch { setError('Unable to delete this conversation.'); }
  }
  async function rename(id: string) {
    const title = prompt('Conversation title'); if (!title?.trim()) return;
    try { await api('/conversations/' + id, { method: 'PATCH', body: JSON.stringify({ title }) }); await list(); }
    catch { setError('Unable to rename this conversation.'); }
  }
  async function send(event: FormEvent) {
    event.preventDefault(); if (!text.trim() || streaming || !profile) return;
    setError(''); setStreaming(true); const content = text; setText('');
    const controller = new AbortController(); abort.current = controller;
    let id = current; let assistant = '';
    try {
      if (!id) { const created = await api<Conversation>('/conversations', { method: 'POST', body: JSON.stringify({ mode }) }); id = created.id; setCurrent(id); }
      await streamReply(id, content, mode, controller.signal, ({ event: name, data }) => {
        if (Array.isArray(data)) { if (name === 'citations') setMessages(items => items.map(item => item.id === assistant ? { ...item, citations: data } : item)); return; }
        if (name === 'meta') {
          assistant = String(data.assistant_message_id);
          setProfile(me => me ? { ...me, prompts_left: Number(data.prompts_left) } : me);
          setMessages(items => [...items,
            { id: String(data.user_message_id), role: 'user', content, status: 'complete', citations: [] },
            { id: assistant, role: 'assistant', content: '', status: 'incomplete', citations: [] }]);
        } else if (name === 'delta') setMessages(items => items.map(item => item.id === assistant ? { ...item, content: item.content + String(data.text) } : item));
        else if (name === 'done') setMessages(items => items.map(item => item.id === assistant ? { ...item, status: 'complete' } : item));
        else if (name === 'error') setError(String(data.message || 'Response unavailable.'));
      });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) setError(err instanceof ApiError ? err.message : 'Response unavailable. Try again.');
    } finally {
      setStreaming(false); abort.current = null;
      await refresh().catch(() => {}); await list().catch(() => {});
    }
  }
  async function feedback(id: string, rating: 1 | -1) {
    try { await api('/messages/' + id + '/feedback', { method: 'POST', body: JSON.stringify({ rating }) }); }
    catch { setError('Unable to save feedback.'); }
  }
  async function theme() {
    if (!profile) return;
    const value = profile.preferences.theme === 'dark' ? 'light' : 'dark';
    try { setProfile(await api<Profile>('/me', { method: 'PATCH', body: JSON.stringify({ preferences: { theme: value } }) })); }
    catch { setError('Unable to update your theme.'); }
  }
  async function logout() { if (!confirm('Log out of Civis?')) return; await Session.signOut(); setProfile(null); router.replace('/'); router.refresh(); }
  if (loading) return <main className="loading"><span className="wordmark">Civis<span>.</span></span><p>Opening your workspace…</p></main>;
  if (!profile) return <Landing />;
  return <div className={'workspace ' + (collapsed ? 'sidebar-collapsed' : '')}>
    <aside className="sidebar"><div className="brand-row"><Link href="/" className="wordmark">Civis<span>.</span></Link><button className="icon-button" aria-label="Collapse sidebar" onClick={() => setCollapsed(true)}><Icon name="panel" /></button></div>
      <button className="new-chat" onClick={() => { if (!streaming) { setCurrent(null); setMessages([]); setError(''); } }}><Icon name="plus" />New conversation</button>
      <p className="section-caption">YOUR WORKSPACE</p><div className="mode-tabs" role="group" aria-label="Conversation mode">{(['research', 'drafting'] as const).map(value => <button key={value} className={mode === value ? 'selected' : ''} onClick={() => setMode(value)} disabled={streaming}>{value === 'research' ? 'Research' : 'Drafting'}</button>)}</div>
      <p className="section-caption recent-caption">RECENT CONVERSATIONS</p><nav className="conversation-list">{conversations.map(item => <div key={item.id} className={'conversation-row ' + (current === item.id ? 'active' : '')}><button className="conversation-title" onClick={() => open(item.id)} onDoubleClick={() => rename(item.id)} title={item.title}><Icon name="chat" /><span>{item.title || 'New conversation'}</span></button><button className="icon-button small" aria-label={'Rename ' + (item.title || 'conversation')} onClick={() => rename(item.id)}>✎</button><button className="icon-button small" aria-label={'Delete ' + (item.title || 'conversation')} onClick={() => remove(item.id)}><Icon name="trash" /></button></div>)}{nextCursor && <button className="text-link" onClick={more}>Show more</button>}</nav>
      <div className="account-wrap">{menu && <div className="account-menu"><p className="muted truncate">{profile.email}</p><button onClick={theme}><Icon name="sun" />{profile.preferences.theme === 'dark' ? 'Light mode' : 'Dark mode'}</button><Link href="/settings"><Icon name="settings" />Account settings</Link><button onClick={() => navigator.clipboard.writeText(location.origin)}><Icon name="plus" />Invite friends</button><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><button onClick={logout}>Log out</button></div>}<button className="account-button" onClick={() => setMenu(!menu)} aria-expanded={menu}><span className="avatar">{(profile.name || profile.email).slice(0, 1).toUpperCase()}</span><span className="account-name"><strong>{profile.name || 'Your account'}</strong><small>{profile.prompts_left} of {profile.free_allowance} free prompts left</small></span><span>⌃</span></button></div>
    </aside><main className="chat-main"><header className="workspace-header"><div className="flex items-center gap-3">{collapsed && <button className="icon-button" aria-label="Open sidebar" onClick={() => setCollapsed(false)}><Icon name="panel" /></button>}<span>{mode === 'research' ? 'Research' : 'Drafting'}</span><span className="header-dot">•</span><span className="muted text-sm">Your workspace</span></div><span className="development-badge">FAKE – development only</span></header>
      {!profile.verified && <div className="verification-banner">Verify your email to use your prompts.<Link href="/auth/verify-email">Verify email →</Link></div>}
      <div className="message-scroll">{messages.length === 0 ? <section className="chat-hero"><div className="hero-mark">C</div><p className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</p><h1>What are we<br />working on today?</h1><p>{mode === 'research' ? 'A focused space for your questions and research.' : 'Bring your ideas and the details you already have.'}</p><div className="suggestions">{(mode === 'research' ? ['Start a research conversation', 'Explore a question step by step', 'Continue an earlier thought'] : ['Describe what you need', 'Organise the details', 'Ask about a drafting workflow']).map(label => <button key={label} onClick={() => setText(label)}>{label}<span>↗</span></button>)}</div></section> : <div className="messages">{messages.map(item => <article key={item.id} className={'message ' + item.role}>{item.role === 'assistant' && <span className="assistant-mark">C</span>}<div className="message-content"><div className="message-text">{item.content || (streaming ? 'Thinking…' : 'Response incomplete.')}</div>{item.citations.length > 0 && <CitationLinks citations={item.citations} />}{item.role === 'assistant' && <div className="message-tools">{item.status === 'incomplete' && !streaming && <span>Incomplete</span>}<button aria-label="Helpful response" onClick={() => feedback(item.id, 1)}>↑</button><button aria-label="Unhelpful response" onClick={() => feedback(item.id, -1)}>↓</button></div>}</div></article>)}<div ref={bottom} /></div>}</div>
      <div className="composer-area">{error && <div role="alert" className="error-banner">{error}</div>}<form className="composer" onSubmit={send}><textarea aria-label="Message" placeholder={mode === 'research' ? 'Ask a question…' : 'Describe what you have in mind…'} value={text} onChange={e => setText(e.target.value)} maxLength={8000} rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (text.trim()) void send(e); } }} /><div className="composer-actions"><span className="composer-mode">{mode === 'research' ? 'Research' : 'Drafting'}<span>⌄</span></span><div className="flex items-center gap-2"><VoiceButton onText={value => setText(old => old + value)} />{streaming ? <button className="send-button" type="button" aria-label="Stop generating" onClick={() => abort.current?.abort()}><Icon name="stop" /></button> : <button className="send-button" aria-label="Send message" disabled={!text.trim() || !profile.verified || profile.prompts_left === 0}><Icon name="arrow" /></button>}</div></div></form><p className="composer-note">FAKE – development only</p></div>
    </main></div>;
}
function CitationLinks({ citations }: { citations: Citation[] }) { return <div className="citations">{citations.map((item, index) => /^https?:\/\//.test(item.source_url) ? <a key={index} href={item.source_url} target="_blank" rel="noopener noreferrer">{item.citation_text} · {item.as_at_date}</a> : null)}</div>; }
function Landing() { return <main className="landing"><nav><Link href="/" className="wordmark">Civis<span>.</span></Link><div><Link href="/auth/signin" className="text-link">Log in</Link><Link href="/auth/signup" className="primary">Create an account</Link></div></nav><section><p className="eyebrow">RESEARCH & DRAFTING · UGANDA</p><h1>A clearer place<br />to begin.</h1><p>Your questions, your research, your next draft.<br />One thoughtful workspace.</p><Link href="/auth/signup" className="primary landing-cta">Get started <span>↗</span></Link><div className="landing-preview"><span className="preview-label">YOUR WORKSPACE</span><div><span>Research</span><span>Drafting</span></div><p>What are we working on today?</p><small>Ask a question… <span>↑</span></small></div><p className="development-label">FAKE – development only</p></section><footer><span>Civis</span><div><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></div></footer></main>; }
type Recognition = { lang: string; interimResults: boolean; onresult: ((event: { results: { transcript: string }[][] }) => void) | null; onend: (() => void) | null; start(): void; stop(): void };
function VoiceButton({ onText }: { onText: (value: string) => void }) {
  const [listening, setListening] = useState(false); const recognition = useRef<Recognition | null>(null);
  useEffect(() => () => recognition.current?.stop(), []);
  function toggle() {
    const scope = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Constructor = scope.SpeechRecognition || scope.webkitSpeechRecognition;
    if (!Constructor) { alert('Voice input is unavailable in this browser.'); return; }
    if (listening) { recognition.current?.stop(); return; }
    const instance = new Constructor(); instance.lang = 'en-UG'; instance.interimResults = false;
    instance.onresult = event => onText(event.results[0][0].transcript); instance.onend = () => setListening(false);
    recognition.current = instance; instance.start(); setListening(true);
  }
  return <button type="button" className={'icon-button ' + (listening ? 'listening' : '')} aria-label={listening ? 'Stop voice input' : 'Browser voice input'} onClick={toggle}><Icon name="mic" /></button>;
}

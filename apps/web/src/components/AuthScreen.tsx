'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { EmailPassword, EmailVerification, initAuth, Session } from '@/lib/auth';
import { api, Legal } from '@/lib/api';

export function AuthScreen({ kind }: { kind: 'signup' | 'signin' | 'reset-password' | 'verify-email' }) {
  const router = useRouter();
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false); const [consent, setConsent] = useState(false);
  const [legal, setLegal] = useState<Legal[]>([]); const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    initAuth();
    Promise.resolve().then(() => setHasToken(new URLSearchParams(location.search).has('token')));
    if (kind === 'signup') Promise.all([api<Legal>('/legal/terms'), api<Legal>('/legal/privacy')])
      .then(setLegal).catch(() => setError('Registration is currently unavailable.'));
  }, [kind]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true); initAuth();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || ''); const password = String(form.get('password') || '');
    try {
      if (kind === 'verify-email') {
        const result = hasToken ? await EmailVerification.verifyEmail() : await EmailVerification.sendVerificationEmail();
        if (result.status !== 'OK' && result.status !== 'EMAIL_ALREADY_VERIFIED_ERROR') throw new Error();
        if (hasToken) router.push('/'); else setNotice('Check your email for a verification link.');
      } else if (kind === 'reset-password') {
        const result = hasToken ? await EmailPassword.submitNewPassword({ formFields: [{ id: 'password', value: password }] }) :
          await EmailPassword.sendPasswordResetEmail({ formFields: [{ id: 'email', value: email }] });
        if (result.status !== 'OK') throw new Error();
        setNotice(hasToken ? 'Password updated. You can sign in.' : 'Check your email for the next step.');
      } else {
        if (kind === 'signup' && (!consent || legal.length !== 2)) throw new Error();
        const values = { formFields: [{ id: 'email', value: email }, { id: 'password', value: password }] };
        const result = kind === 'signup' ? await EmailPassword.signUp(values) : await EmailPassword.signIn(values);
        if (result.status !== 'OK') throw new Error();
        if (kind === 'signup') {
          await api('/me', { method: 'PATCH', body: JSON.stringify({ name: String(form.get('name') || '') }) });
          for (const document of legal) await api('/me/consents', { method: 'POST', body: JSON.stringify({ document: document.document, version: document.version }) });
          await EmailVerification.sendVerificationEmail();
          router.push('/auth/verify-email');
        } else if (await Session.doesSessionExist()) router.push('/');
      }
    } catch { setError(kind === 'signin' ? 'Unable to sign in. Check your details.' : 'Unable to complete this step. Try again.'); }
    finally { setBusy(false); }
  }
  const title = { signup: 'Create your workspace', signin: 'Welcome back', 'reset-password': hasToken ? 'Choose a new password' : 'Reset your password', 'verify-email': 'Verify your email' }[kind];
  return <main className="auth-shell"><Link href="/" className="wordmark">Civis<span>.</span></Link>
    <section className="auth-card"><p className="eyebrow">YOUR CIVIS ACCOUNT</p><h1>{title}</h1>
      <form onSubmit={submit} className="auth-form">
        {kind === 'signup' && <label>Name<input name="name" autoComplete="name" required maxLength={200} /></label>}
        {(kind === 'signup' || kind === 'signin' || (kind === 'reset-password' && !hasToken)) && <label>Email<input name="email" type="email" autoComplete="email" required /></label>}
        {(kind === 'signup' || kind === 'signin' || (kind === 'reset-password' && hasToken)) && <label>Password<input name="password" type="password" autoComplete={kind === 'signin' ? 'current-password' : 'new-password'} required minLength={8} /></label>}
        {kind === 'signup' && <><label className="consent"><input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required />{legal[0]?.consent_label || 'Loading…'}</label><div className="muted text-sm"><Link href="/legal/terms">Terms</Link> · <Link href="/legal/privacy">Privacy</Link></div></>}
        {error && <p role="alert" className="error-text">{error}</p>}{notice && <p role="status">{notice}</p>}
        <button className="primary" disabled={busy || (kind === 'signup' && legal.length !== 2)}>{busy ? 'Please wait…' : kind === 'verify-email' ? (hasToken ? 'Verify email' : 'Resend verification email') : 'Continue'}</button>
      </form><div className="auth-links"><Link href="/auth/signin">Sign in</Link><Link href="/auth/signup">Sign up</Link><Link href="/auth/reset-password">Forgot password?</Link></div>
    </section><p className="development-label">FAKE – development only</p></main>;
}

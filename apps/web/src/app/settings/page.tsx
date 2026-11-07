'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api, Profile } from '@/lib/api';
export default function Settings() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null); const [notice, setNotice] = useState('');
  useEffect(() => { api<Profile>('/me').then(setProfile).catch(() => router.replace('/auth/signin')); }, [router]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try { setProfile(await api<Profile>('/me', { method: 'PATCH', body: JSON.stringify({ name: form.get('name'), preferences: { theme: form.get('theme') } }) })); setNotice('Saved.'); }
    catch { setNotice('Unable to save settings.'); }
  }
  return <main className="document-page"><Link href="/" className="wordmark">Civis<span>.</span></Link><h1>Account settings</h1>{profile && <form onSubmit={save} className="auth-form"><label>Name<input name="name" defaultValue={profile.name} maxLength={200} /></label><label>Email<input value={profile.email} readOnly /></label><label>Theme<select name="theme" defaultValue={profile.preferences.theme}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><button className="primary">Save changes</button></form>}<p role="status">{notice}</p><section className="data-settings"><h2>Your data</h2><button disabled>Export my data</button><button disabled>Delete account</button><p className="muted">Data tools are currently unavailable.</p></section><Link href="/">Back to workspace</Link></main>;
}

'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, Legal } from '@/lib/api';
export function LegalScreen({ document }: { document: string }) {
  const [value, setValue] = useState<Legal | null>(null); const [error, setError] = useState('');
  useEffect(() => { api<Legal>('/legal/' + encodeURIComponent(document)).then(setValue).catch(() => setError('This document is currently unavailable.')); }, [document]);
  return <main className="document-page"><Link href="/" className="wordmark">Civis<span>.</span></Link><h1>{document === 'privacy' ? 'Privacy' : 'Terms'}</h1>{error && <p role="alert">{error}</p>}{value ? <><p className="muted">Version {value.version}</p><div className="whitespace-pre-wrap">{value.text}</div></> : !error && <p>Loading…</p>}<Link href="/">Back to Civis</Link></main>;
}

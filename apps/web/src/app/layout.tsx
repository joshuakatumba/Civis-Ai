import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = { title: 'Civis', description: 'Your research and drafting workspace.', manifest: '/manifest.webmanifest' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('civis-theme')||'system'}catch{}" }} /></head><body>{children}</body></html>;
}

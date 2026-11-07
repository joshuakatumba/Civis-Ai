import { AuthScreen } from '@/components/AuthScreen';
export default async function AuthPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const route = (await params).path?.[0];
  const kind = route === 'signup' || route === 'reset-password' || route === 'verify-email' ? route : 'signin';
  return <AuthScreen kind={kind} />;
}

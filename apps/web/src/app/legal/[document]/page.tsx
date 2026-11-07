import { LegalScreen } from '@/components/LegalScreen';
export default async function LegalPage({ params }: { params: Promise<{ document: string }> }) {
  return <LegalScreen document={(await params).document} />;
}

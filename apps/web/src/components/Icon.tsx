type Name = 'plus' | 'arrow' | 'panel' | 'chat' | 'trash' | 'sun' | 'settings' | 'mic' | 'check' | 'stop';
const paths: Record<Name, string> = {
  plus: 'M12 5v14M5 12h14', arrow: 'M12 19V5M5 12l7-7 7 7',
  panel: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM9 3v18',
  chat: 'M21 11a8 8 0 0 1-8 8H7l-4 3V11a9 9 0 0 1 18 0Z',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1',
  settings: 'M4 7h16M4 17h16M8 4v6M16 14v6',
  mic: 'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 11v1a7 7 0 0 0 14 0v-1M12 19v3M8 22h8',
  check: 'M5 12l4 4L19 6', stop: 'M6 6h12v12H6Z',
};
export function Icon({ name }: { name: Name }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

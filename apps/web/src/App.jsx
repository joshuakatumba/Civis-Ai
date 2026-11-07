import { useEffect, useState } from "react";
import { store, ACCOUNTS } from "./lib/storage.js";
import Auth from "./components/Auth.jsx";
import Shell from "./components/Shell.jsx";
export default function App() {
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [session, setSession] = useState(0);
  useEffect(() => {
    const s = store.get("civis-session", null);
    if (s && ACCOUNTS[s]) setUser({ email: s, name: ACCOUNTS[s].name });
  }, []);
  return (
    <div className={"cv" + (dark ? " dark" : "")}>
      {user
        ? <Shell key={session} user={user} dark={dark} setDark={setDark} onLogout={() => { store.del("civis-session"); setUser(null); setSession((s) => s + 1); }} />
        : <Auth onAuth={setUser} />}
    </div>
  );
}

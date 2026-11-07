import { useEffect, useState } from "react";
import { http } from "./lib/http.js";
import Auth from "./components/Auth.jsx";
import Shell from "./components/Shell.jsx";
export default function App() {
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [session, setSession] = useState(0);
  const acceptUser = (profile) => {
    setUser(profile);
    setDark(profile.preferences.theme === "dark");
  };
  useEffect(() => {
    // Remove legacy demo credentials; all sessions now use provider httpOnly cookies.
    for (const key of ["civis-session", "civis-accounts"]) {
      try { localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
    }
    const unauthenticated = () => { setUser(null); setSession((s) => s + 1); };
    window.addEventListener("civis:unauthenticated", unauthenticated);
    http("/v1/me").then(acceptUser).catch(() => {});
    return () => window.removeEventListener("civis:unauthenticated", unauthenticated);
  }, []);
  const logout = async () => {
    await http("/auth/signout", { method: "POST", headers: { rid: "session" }, retry: false });
    setUser(null);
    setSession((s) => s + 1);
  };
  const changeDark = async (value) => {
    await http("/v1/me", { method: "PATCH", body: { preferences: { theme: value ? "dark" : "light" } } });
    setDark(value);
  };
  return (
    <div className={"cv" + (dark ? " dark" : "")}>
      {user
        ? <Shell key={session} user={user} dark={dark} setDark={changeDark} onLogout={logout} />
        : <Auth onAuth={acceptUser} />}
    </div>
  );
}

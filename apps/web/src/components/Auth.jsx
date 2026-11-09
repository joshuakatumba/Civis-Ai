import { useRef, useState } from "react";
import { authenticate } from "../lib/http.js";
function Auth({ onAuth, onRecovery }) {
  const [m, setM] = useState("login");
  const [f, setF] = useState({ name: "", email: "", pw: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    const email = f.email.trim().toLowerCase();
    if (m === "signup" && !f.name.trim()) return setErr("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a valid email address.");
    if (f.pw.length < 8) return setErr("Use a password of at least 8 characters.");
    submitting.current = true; setBusy(true);
    try {
      setErr("");
      onAuth(await authenticate(m, { email, pw: f.pw, name: f.name }));
    } catch (error) { setErr(error.message); }
    finally { submitting.current = false; setBusy(false); }
  };

  return (
    <div className="auth">
      <div className="ahead">Civis</div>
      <div className="amain">
        <div className="apitch">
          <h1>Legal help in plain language</h1>
          <p>Ask legal questions and draft contracts, letters and notices in minutes.</p>
          <ul><li>Clear answers you can act on</li><li>Ready-made templates for every document</li><li>Download your draft as a Word file</li></ul>
        </div>
        <div className="acard">
          <div className="atabs">
            <button type="button" className={"atab" + (m === "login" ? " on" : "")} onClick={() => { setM("login"); setErr(""); }}>Log in</button>
            <button type="button" className={"atab" + (m === "signup" ? " on" : "")} onClick={() => { setM("signup"); setErr(""); }}>Sign up</button>
          </div>
          <div className="af" onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName === "INPUT") submit(e); }}>
            {m === "signup" && <label><span>Full name</span><input value={f.name} onChange={set("name")} autoComplete="name" /></label>}
            <label><span>Email</span><input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
            <label><span>Password</span><input type="password" value={f.pw} onChange={set("pw")} autoComplete={m === "signup" ? "new-password" : "current-password"} /></label>
            <p className="aerr" role="alert">{err}</p>
            <button className="abtn" disabled={busy} type="button" onClick={submit}>{m === "signup" ? "Create account" : "Log in"}</button>
          </div>
          <p className="aswap">
            {m === "signup" ? "Already have an account? " : "New to Civis? "}
            <button type="button" onClick={() => { setM(m === "signup" ? "login" : "signup"); setErr(""); }}>{m === "signup" ? "Log in" : "Create an account"}</button>
          </p>
          <p className="aswap"><button type="button" onClick={onRecovery}>Forgot password?</button></p>
        </div>
      </div>
    </div>
  );
}

export default Auth;

/* SEAM: replace with real auth (sign up, verify, log in, reset, log out). */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};
/* Prototype only: accounts live in this browser. Passwords are hashed but this is not real security. */
const ACCOUNTS = store.get("civis-accounts", {});
async function hashPw(s) {
  try {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("civis:" + s));
    return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
  } catch (e) { return "p:" + btoa(unescape(encodeURIComponent(s))); }
}

export { store, ACCOUNTS, hashPw };

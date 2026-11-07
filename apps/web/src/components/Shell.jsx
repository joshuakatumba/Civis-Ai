import { useEffect, useRef, useState } from "react";
import { http } from "../lib/http.js";
import { askCivis } from "../lib/api.js";
import useMic from "../hooks/useMic.js";
import Sidebar from "./Sidebar.jsx";
import ChatView from "./ChatView.jsx";
import Composer from "./Composer.jsx";
import Panel from "./DocPanel.jsx";
import Modal from "./Modal.jsx";
const emptyChat = { id: null, title: "New chat", msgs: [], doc: null };
const fromConversation = (c) => ({ ...c, title: c.title || "New chat", msgs: (c.messages || []).map((m) => ({ id: m.id, r: m.document_id ? "f" : m.role === "user" ? "u" : "a", t: m.content, document_id: m.document_id })), doc: null });

function Shell({ user, dark, setDark, onLogout }) {
  const [chats, setChats] = useState([emptyChat]);
  const [cur, selectCur] = useState(null);
  const [mode, setMode] = useState("research");
  const [left, setLeft] = useState(user.prompts_left);
  const [min, setMin] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const taRef = useRef(null);

  const chat = chats.find((c) => c.id === cur) || emptyChat;
  const tplView = mode === "drafting" && chat.msgs.length === 0;
  const doc = chat.doc && !chat.doc.closed ? chat.doc : null;

  const say = (t) => { setToast(t); setTimeout(() => setToast(""), 2300); };
  const upd = (id, fn) => setChats((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  const setDoc = (d) => upd(cur, (c) => ({ ...c, doc: d }));
  const mic = useMic((t) => setInput((v) => (v ? v + " " : "") + t), say);

  useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = 1e9); }, [chat.msgs.length, busy, cur, mode]);
  useEffect(() => {
    if (!menu) return undefined;
    const h = () => setMenu(false);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [menu]);
  useEffect(() => {
    const ta = taRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 160) + "px"; }
  }, [input]);

  const loadChat = async (id) => {
    const c = fromConversation(await http(`/v1/conversations/${id}`));
    const lastFile = [...c.msgs].reverse().find((m) => m.document_id);
    if (lastFile) {
      const d = await http(`/v1/documents/${lastFile.document_id}`);
      c.doc = { ...d, vals: d.values, tab: "preview", done: true, closed: false, touched: {} };
    }
    setChats((cs) => cs.some((old) => old.id === c.id) ? cs.map((old) => old.id === c.id ? c : old) : [c, ...cs.filter((old) => old.id)]);
    selectCur(c.id);
    setMode(c.mode);
    return c;
  };
  const setCur = (id) => { loadChat(id).catch((e) => say(e.message)); };
  useEffect(() => {
    let live = true;
    (async () => {
      let cursor, items = [];
      do {
        const page = await http(`/v1/conversations?limit=100${cursor ? `&cursor=${cursor}` : ""}`);
        items.push(...page.items); cursor = page.next_cursor;
      } while (cursor);
      if (!live || !items.length) return;
      setChats(items.map(fromConversation));
      await loadChat(items[0].id);
    })().catch((e) => say(e.message));
    return () => { live = false; };
  }, []);
  const newChat = async () => {
    try {
      const c = fromConversation(await http("/v1/conversations", { body: { mode } }));
      setChats((cs) => [c, ...cs.filter((old) => old.id)]);
      selectCur(c.id);
      setOpen(false);
      return c.id;
    } catch (e) { say(e.message); return null; }
  };
  const draftValues = doc ? JSON.stringify(doc.vals) : "";
  useEffect(() => {
    if (!doc) return;
    const id = cur, slug = doc.slug, values = doc.vals;
    let live = true;
    const timer = setTimeout(() => {
      http(`/v1/templates/${slug}/render`, { body: { values, format: "html" } })
        .then(({ html }) => { if (live) upd(id, (c) => c.doc?.slug === slug ? { ...c, doc: { ...c.doc, html } } : c); })
        .catch((e) => { if (live) say(e.message); });
    }, 250);
    return () => { live = false; clearTimeout(timer); };
  }, [cur, doc?.slug, draftValues]);
  const pickMode = (m) => {
    setMode(m);
    if (m === "drafting" && chat.msgs.length) newChat();
  };
  const showSub = () => setModal({ title: "Civis Pro", body: <p>Longer documents, contract review and priority answers for people who use Civis every day.</p>, actions: [{ label: "Not now" }, { label: "Upgrade", pri: true, fn: () => say("Payments are not connected yet") }] });

  const send = async () => {
    const t = input.trim();
    if (!t || busy) return;
    if (left <= 0) return showSub();
    setBusy(true);
    setInput("");
    const id = cur || await newChat();
    if (!id) { setBusy(false); return; }
    upd(id, (c) => ({ ...c, title: c.msgs.length ? c.title : t.length > 34 ? t.slice(0, 34) + "\u2026" : t, msgs: [...c.msgs, { r: "u", t }, { r: "a", t: "", streaming: true }] }));
    try {
      await askCivis({ id, mode, content: t, onEvent: (event, data) => {
        if (event === "meta") setLeft(data.prompts_left); // SEAM: the server must own this count
        if (event === "delta") upd(id, (c) => ({ ...c, msgs: c.msgs.map((m) => m.streaming ? { ...m, t: m.t + data.text } : m) }));
      } });
    } catch (e) {
      if (e.code === "quota_exhausted") showSub(); else say(e.message);
    } finally {
      try {
        await loadChat(id);
        setLeft((await http("/v1/me")).prompts_left);
      } catch (e) { say(e.message); }
      setBusy(false);
    }
  };

  const pickTemplate = async (n, slug) => {
    if (busy) return;
    setBusy(true);
    try {
      const template = await http(`/v1/templates/${slug}`);
      const vals = Object.fromEntries(template.fields.map((f) => [f.key, f.example]));
      const preview = await http(`/v1/templates/${slug}/render`, { body: { values: vals, format: "html" } });
      const id = cur || await newChat();
      if (!id) return;
      await http(`/v1/conversations/${id}`, { method: "PATCH", body: { title: n } });
      upd(id, (c) => ({ ...c, title: n,
        doc: { name: n, slug, fields: template.fields, vals, html: preview.html, tab: "fields", done: false, closed: false, touched: {} },
        msgs: [...c.msgs, { r: "u", t: "Draft a " + n }, { r: "t", t: `I found the ${n} template. The form on the right has an example in each field. Replace the examples with your own details, then press Generate.` }],
      }));
    } catch (e) { say(e.message); } finally { setBusy(false); }
  };
  const generate = async () => {
    if (busy) return;
    setBusy(true);
    const id = cur;
    try {
      await http(`/v1/templates/${doc.slug}/render`, { body: { values: doc.vals, format: "docx", conversation_id: id } });
      await loadChat(id);
    } catch (e) { say(e.message); } finally { setBusy(false); }
  };
  const openDoc = async (tab, identifier) => {
    try {
      if (identifier) {
        const d = await http(`/v1/documents/${identifier}`);
        setDoc({ ...d, vals: d.values, tab, done: true, closed: false, touched: {} });
      } else upd(cur, (c) => ({ ...c, doc: { ...c.doc, closed: false, tab } }));
    } catch (e) { say(e.message); }
  };
  const legal = async (document, title) => {
    try {
      const data = await http(`/v1/legal/${document}`);
      setModal({ title, body: <p>{data.text}</p>, actions: [{ label: "Close", pri: true }] });
    } catch (e) { say(e.message); }
  };

  const menuAct = {
    sub: showSub,
    inv: () => setModal({ title: "Invite friends", body: (<><p>Share this link with anyone who could use Civis.</p><div className="link">{window.location.href}</div></>), actions: [{ label: "Close" }, { label: "Copy link", pri: true, fn: () => { navigator.clipboard?.writeText(window.location.href).then(() => say("Link copied"), () => say("Copy the link above")); } }] }),
    fb: () => { let v = ""; setModal({ title: "Feedback & support", body: (<><p>Tell us what went wrong or what you would like Civis to do.</p><textarea placeholder="Write your message" onChange={(e) => { v = e.target.value; }} /></>), actions: [{ label: "Cancel" }, { label: "Send", pri: true, fn: async () => { if (v.trim()) { try { await http("/v1/feedback", { body: { category: "feedback", message: v.trim(), conversation_id: cur } }); say("Thanks, your message was sent"); } catch (e) { say(e.message); } } } }] }); },
    ins: () => setModal({ title: "Install app", body: <p>Open your browser menu and choose Install app or Add to Home Screen.</p>, actions: [{ label: "Got it", pri: true }] }),
    dark: () => setDark(!dark).catch((e) => say(e.message)),
    pri: () => legal("privacy", "Privacy Policy"),
    ter: () => legal("terms", "Terms & Conditions"),
    x: () => window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent("I use Civis, an AI assistant for legal questions."), "_blank", "noopener"),
    out: () => setModal({ title: "Log out of Civis?", body: <p>You can log back in at any time.</p>, actions: [{ label: "Cancel" }, { label: "Log out", pri: true, fn: () => onLogout().catch((e) => say(e.message)) }] }),
  };
  const MENU = [
    ["sub", "gem", "Subscribe"], ["inv", "users", "Invite friends"], ["fb", "mail", "Feedback & support"], ["ins", "down", "Install app"],
    ["dark", "moon", dark ? "Light mode" : "Dark mode"], "-",
    ["pri", "shield", "Privacy Policy"], ["ter", "doc", "Terms & Conditions"], ["x", "share", "Share about Civis on X"], "-",
    ["out", "out", "Logout"],
  ];



  return (
    <div className="app">
      <Sidebar {...{ min, open, setMin, setOpen, newChat, pickMode, mode, chats, cur, setCur, menu, setMenu, user, left, MENU, menuAct }} />

      <ChatView {...{ setOpen, open, scrollRef, tplView, pickTemplate, say, chat, setInput, taRef, busy, openDoc }}>
        <Composer {...{ tplView, mic, taRef, input, setInput, send, mode, showSub, busy }} />
      </ChatView>

      {doc && <Panel doc={doc} setDoc={setDoc} onGenerate={generate} onClose={() => upd(cur, (c) => ({ ...c, doc: { ...c.doc, closed: true } }))} />}

      {modal && <Modal modal={modal} setModal={setModal} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default Shell;

import { useEffect, useRef, useState } from "react";
import { KINDS, kindOf } from "../data/kinds.js";
import { catOf } from "../data/templates.js";
import { askCivis } from "../lib/api.js";
import useMic from "../hooks/useMic.js";
import Sidebar from "./Sidebar.jsx";
import ChatView from "./ChatView.jsx";
import Composer from "./Composer.jsx";
import Panel from "./DocPanel.jsx";
import Modal from "./Modal.jsx";
let nextId = 2;

function Shell({ user, dark, setDark, onLogout }) {
  const [chats, setChats] = useState([{ id: 1, title: "New chat", msgs: [], doc: null }]);
  const [cur, setCur] = useState(1);
  const [mode, setMode] = useState("research");
  const [left, setLeft] = useState(20);
  const [min, setMin] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const taRef = useRef(null);

  const chat = chats.find((c) => c.id === cur);
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

  const newChat = () => {
    const id = nextId++;
    setChats((cs) => [{ id, title: "New chat", msgs: [], doc: null }, ...cs]);
    setCur(id);
    setOpen(false);
  };
  const pickMode = (m) => {
    setMode(m);
    if (m === "drafting" && chat.msgs.length) newChat();
  };
  const showSub = () => setModal({ title: "Civis Pro", body: <p>Longer documents, contract review and priority answers for people who use Civis every day.</p>, actions: [{ label: "Not now" }, { label: "Upgrade", pri: true, fn: () => say("Payments are not connected yet") }] });

  const send = async () => {
    const t = input.trim();
    if (!t || busy) return;
    if (left <= 0) return showSub();
    const id = cur;
    upd(id, (c) => ({ ...c, title: c.msgs.length ? c.title : t.length > 34 ? t.slice(0, 34) + "\u2026" : t, msgs: [...c.msgs, { r: "u", t }] }));
    setInput("");
    setLeft((n) => n - 1); // SEAM: the server must own this count
    setBusy(true);
    const history = [...chat.msgs, { r: "u", t }].filter((m) => m.r === "u" || m.r === "a");
    try {
      const a = await askCivis({ mode, messages: history });
      upd(id, (c) => ({ ...c, msgs: [...c.msgs, { r: "a", t: a }] }));
    } catch (e) {
      upd(id, (c) => ({ ...c, msgs: [...c.msgs, { r: "a", t: "The assistant is unavailable. Try again." }] }));
    }
    setBusy(false);
  };

  const pickTemplate = (n) => {
    const kind = kindOf(n, catOf(n));
    const vals = {};
    KINDS[kind].f.forEach(([k, , ex]) => { vals[k] = ex; });
    upd(cur, (c) => ({
      ...c,
      title: n,
      doc: { name: n, kind, vals, tab: "fields", done: false, closed: false, touched: {} },
      msgs: [...c.msgs, { r: "u", t: "Draft a " + n }, { r: "t", t: `I found the ${n} template. The form on the right has an example in each field. Replace the examples with your own details, then press Generate.` }],
    }));
  };
  const generate = () => {
    upd(cur, (c) => ({
      ...c,
      doc: { ...c.doc, done: true, tab: "preview" },
      msgs: [...c.msgs, { r: "u", t: "Generate the draft" }, { r: "a", t: "Your draft is ready." }, { r: "f", t: c.doc.name }],
    }));
  };
  const openDoc = (tab) => upd(cur, (c) => ({ ...c, doc: { ...c.doc, closed: false, tab } }));

  const menuAct = {
    sub: showSub,
    inv: () => setModal({ title: "Invite friends", body: (<><p>Share this link with anyone who could use Civis.</p><div className="link">{window.location.href}</div></>), actions: [{ label: "Close" }, { label: "Copy link", pri: true, fn: () => { navigator.clipboard?.writeText(window.location.href).then(() => say("Link copied"), () => say("Copy the link above")); } }] }),
    fb: () => { let v = ""; setModal({ title: "Feedback & support", body: (<><p>Tell us what went wrong or what you would like Civis to do.</p><textarea placeholder="Write your message" onChange={(e) => { v = e.target.value; }} /></>), actions: [{ label: "Cancel" }, { label: "Send", pri: true, fn: () => { if (v.trim()) say("Thanks, your message was sent"); } }] }); },
    ins: () => setModal({ title: "Install app", body: <p>Open your browser menu and choose Install app or Add to Home Screen.</p>, actions: [{ label: "Got it", pri: true }] }),
    dark: () => setDark(!dark),
    pri: () => setModal({ title: "Privacy Policy", body: <p>Placeholder. Replace with your approved privacy policy.</p>, actions: [{ label: "Close", pri: true }] }),
    ter: () => setModal({ title: "Terms & Conditions", body: <p>Placeholder. Replace with your approved terms.</p>, actions: [{ label: "Close", pri: true }] }),
    x: () => window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent("I use Civis, an AI assistant for legal questions."), "_blank", "noopener"),
    out: () => setModal({ title: "Log out of Civis?", body: <p>You can log back in at any time.</p>, actions: [{ label: "Cancel" }, { label: "Log out", pri: true, fn: onLogout }] }),
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

      <ChatView {...{ setOpen, open, scrollRef, tplView, pickTemplate, chat, setInput, taRef, busy, openDoc }}>
        <Composer {...{ tplView, mic, taRef, input, setInput, send, mode, showSub, busy }} />
      </ChatView>

      {doc && <Panel doc={doc} setDoc={setDoc} onGenerate={generate} onClose={() => upd(cur, (c) => ({ ...c, doc: { ...c.doc, closed: true } }))} />}

      {modal && <Modal modal={modal} setModal={setModal} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default Shell;

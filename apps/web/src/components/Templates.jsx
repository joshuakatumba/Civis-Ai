import { useMemo, useState } from "react";
import { TPL, POP } from "../data/templates.js";
import Icon from "./Icon.jsx";
function Templates({ onPick }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [all, setAll] = useState(false);
  const total = useMemo(() => Object.values(TPL).reduce((s, a) => s + a.length, 0), []);

  const list = useMemo(() => {
    if (!cat && !q) return [];
    const out = [];
    Object.keys(TPL).forEach((c) => TPL[c].forEach((n) => out.push([n, c])));
    const rank = (n) => (POP.includes(n) ? POP.indexOf(n) : 99);
    out.sort((a, b) => rank(a[0]) - rank(b[0]));
    const r = out.filter((x) => (!cat || x[1] === cat) && x[0].toLowerCase().includes(q.toLowerCase()));
    if (cat) r.sort((a, b) => a[0].localeCompare(b[0]));
    return r;
  }, [q, cat]);
  const shown = all ? list : list.slice(0, 9);

  return (
    <div className="tpl">
      <div className="ts"><Icon n="search" /><input value={q} onChange={(e) => { setQ(e.target.value); setAll(false); }} placeholder={`Search ${total} templates\u2026`} autoComplete="off" /></div>
      <div className="chips">
        {Object.keys(TPL).map((c) => (
          <button key={c} className={"chip" + (c === cat ? " on" : "")} onClick={() => { setCat(c === cat ? "" : c); setAll(false); }}>
            {c} <em>{TPL[c].length}</em>
          </button>
        ))}
      </div>
      <div className="tg">
        {shown.map(([n, c]) => (
          <button key={n} className="tc" onClick={() => onPick(n)}>
            <Icon n="doc" /><span><b>{n}</b><i>{c}</i></span>
          </button>
        ))}
        {!list.length && <p className="none">{cat || q ? "No templates match your search." : "Choose a category to see its templates."}</p>}
        {list.length > 9 && !all && <button className="more" onClick={() => setAll(true)}>Show all {list.length}</button>}
      </div>
    </div>
  );
}

export default Templates;

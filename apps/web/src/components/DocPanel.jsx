import { downloadDoc } from "../lib/doc.js";
import Icon from "./Icon.jsx";
function Panel({ doc, setDoc, onGenerate, onClose }) {
  return (
    <aside className="panel">
      <div className="ph">
        <h2>{doc.name}</h2>
        <div className="seg">
          {["fields", "preview"].map((t) => (
            <button key={t} className={doc.tab === t ? "on" : ""} onClick={() => setDoc({ ...doc, tab: t })}>{t === "fields" ? "Fields" : "Preview"}</button>
          ))}
        </div>
        <button className="gen" onClick={onGenerate}>Generate</button>
        {doc.done && <button className="ic" aria-label="Download" onClick={() => downloadDoc(doc)}><Icon n="down" /></button>}
        <button className="ic" aria-label="Close" onClick={onClose}><Icon n="x" /></button>
      </div>
      <div className="pb">
        {doc.tab === "fields" ? (
          <>
            <p className="hint">Replace the examples with your details, then press Generate.</p>
            {doc.fields.map(({ key: k, label }) => {
              const big = k === "det" || k === "rel";
              const common = {
                value: doc.vals[k] ?? "",
                onChange: (e) => setDoc({ ...doc, vals: { ...doc.vals, [k]: e.target.value } }),
                onFocus: (e) => { if (!doc.touched[k]) { doc.touched[k] = true; e.target.select(); } },
              };
              return (
                <label className="fld" key={k}>
                  <span>{label}</span>
                  {big ? <textarea {...common} /> : <input {...common} />}
                </label>
              );
            })}
          </>
        ) : (
          <div className="sheet" dangerouslySetInnerHTML={{ __html: doc.html }} />
        )}
      </div>
    </aside>
  );
}

export default Panel;

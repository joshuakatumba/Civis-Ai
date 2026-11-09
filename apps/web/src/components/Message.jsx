import Icon from "./Icon.jsx";
import { slug, downloadDoc } from "../lib/doc.js";
const Msg = ({ m, openDoc, chat }) => {
    if (m.r === "u") return <div className="msg u"><div className="b">{m.t}</div></div>;
    return (
      <div className="msg a">
        <div className="mk">C</div>
        <div className="b">
          {m.r === "f" ? (
            <div className="file">
              <div className="fi"><Icon n="doc" /></div>
              <div className="fm"><b>{slug(m.t)}.docx</b><i>Word document</i></div>
              <button className="btn" onClick={() => openDoc("preview", m.document_id)}>Open</button>
              <button className="ic" aria-label="Download" onClick={() => downloadDoc({ id: m.document_id, filename: slug(m.t) + ".docx" })}><Icon n="down" /></button>
            </div>
          ) : (<><p>{m.t}{m.citations?.map((c, i) => (
              <span key={c.id}><br /><a href={c.url} target="_blank" rel="noopener noreferrer">[{i + 1}] {c.title} ({c.date})</a></span>
            ))}</p>{m.r === "t" && <button className="btn" onClick={() => openDoc("fields")}>Open form</button>}</>)}
        </div>
      </div>
    );
  };

export default Msg;

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
              <div className="fm"><b>{slug(m.t)}.doc</b><i>Word document</i></div>
              <button className="btn" onClick={() => openDoc("preview")}>Open</button>
              <button className="ic" aria-label="Download" onClick={() => downloadDoc(chat.doc)}><Icon n="down" /></button>
            </div>
          ) : (<><p>{m.t}</p>{m.r === "t" && <button className="btn" onClick={() => openDoc("fields")}>Open form</button>}</>)}
        </div>
      </div>
    );
  };

export default Msg;

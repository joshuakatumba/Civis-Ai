import Icon from "./Icon.jsx";
function Composer({ tplView, mic, taRef, input, setInput, send, mode, showSub, busy }) {
  return (
        <div className="bar">
          <div className={"box" + (tplView ? " wide" : "")}>
            {mic.on ? (
              <div className="voice">
                <div className="vt">{mic.text || "Listening\u2026"}</div>
                <div className="vr">
                  <div className="wv">{Array.from({ length: 28 }, (_, i) => <i key={i} ref={(el) => { mic.bars.current[i] = el; }} />)}</div>
                  <button className="ic" aria-label="Cancel" onClick={() => mic.stop(false)}><Icon n="x" /></button>
                  <button className="send" aria-label="Use text" onClick={() => mic.stop(true)}>✓</button>
                </div>
              </div>
            ) : (
              <>
                <textarea ref={taRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={tplView ? "Describe the document you need, or pick a template above" : mode === "drafting" ? "Describe the document you need" : "Ask Civis a legal question"} />
                <div className="tools">
                  <button className="ic" aria-label="Voice input" onClick={() => mic.start()}><Icon n="mic" /></button>
                  <span className="sp" />
                  <button className="subl" onClick={showSub}><Icon n="info" />Subscribe</button>
                  <button className="send" aria-label="Send" disabled={!input.trim() || busy} onClick={send}>↑</button>
                </div>
              </>
            )}
          </div>
          <p className="note">Civis is AI and can make mistakes. It is not a substitute for a lawyer.</p>
        </div>
  );
}

export default Composer;

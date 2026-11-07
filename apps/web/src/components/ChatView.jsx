import { IDEAS } from "../lib/api.js";
import Templates from "./Templates.jsx";
import Msg from "./Message.jsx";
function ChatView({ setOpen, open, scrollRef, tplView, pickTemplate, say, chat, setInput, taRef, busy, openDoc, children }) {
  return (
      <main className="main">
        <div className="top">
          <button className="ic" aria-label="Open sidebar" onClick={() => setOpen(!open)}>☰</button>
          <strong style={{ fontFamily: "Georgia,serif", color: "var(--accent)" }}>Civis</strong>
        </div>
        <div className="scroll" ref={scrollRef} onClick={() => setOpen(false)}>
          <div className="wrap">
            {tplView ? <Templates onPick={pickTemplate} onError={say} />
              : chat.msgs.length === 0 ? (
                <div className="hero">
                  <h1>What would you like to research?</h1>
                  <div className="ideas">{IDEAS.research.map((i) => <button key={i} className="idea" onClick={() => { setInput(i); taRef.current?.focus(); }}>{i}</button>)}</div>
                </div>
              ) : (
                <>
                  {chat.msgs.map((m, i) => <Msg key={i} m={m} openDoc={openDoc} chat={chat} />)}
                  {busy && <div className="msg a"><div className="mk">C</div><div className="b dots"><span /><span /><span /></div></div>}
                </>
              )}
          </div>
        </div>
        {children}
      </main>
  );
}

export default ChatView;

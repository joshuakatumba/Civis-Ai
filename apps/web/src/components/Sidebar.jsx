import Icon from "./Icon.jsx";
function Sidebar({ min, open, setMin, setOpen, newChat, pickMode, mode, chats, cur, setCur, menu, setMenu, user, left, MENU, menuAct }) {
  return (
      <aside className={"side" + (min ? " min" : "") + (open ? " open" : "")}>
        {min ? (
          <div className="rail">
            <button className="ic" aria-label="Open sidebar" onClick={() => setMin(false)}><Icon n="panelOpen" /></button>
            <button className="ic" aria-label="New chat" onClick={newChat}><Icon n="edit" /></button>
            <button className="ic" aria-label="Drafting" onClick={() => pickMode("drafting")}><Icon n="draft" /></button>
            <button className="ic" aria-label="Chat history" onClick={() => setMin(false)}><Icon n="clock" /></button>
          </div>
        ) : (
          <>
            <div className="brandrow">
              <div className="brand">Civis</div>
              <button className="ic" style={{ marginTop: -8 }} aria-label="Close sidebar" onClick={() => (window.innerWidth <= 760 ? setOpen(false) : setMin(true))}><Icon n="panelClose" /></button>
            </div>
            <button className="new" onClick={newChat}>＋ New chat</button>
            <div className="modes" role="group" aria-label="Mode">
              <button className={"mode" + (mode === "research" ? " on" : "")} aria-pressed={mode === "research"} onClick={() => pickMode("research")}><Icon n="book" />Research</button>
              <button className={"mode" + (mode === "drafting" ? " on" : "")} aria-pressed={mode === "drafting"} onClick={() => pickMode("drafting")}><Icon n="draft" />Drafting</button>
            </div>
            <div className="list">
              {chats.map((c) => (
                <button key={c.id} className={"chat" + (c.id === cur ? " on" : "")} onClick={() => { setCur(c.id); setOpen(false); }}>{c.title}</button>
              ))}
            </div>
            <div className="acct" onClick={(e) => e.stopPropagation()}>
              {menu && (
                <div className="pop" role="menu">
                  <div className="mail">{user.email}</div>
                  {MENU.map((it, i) => it === "-" ? <div className="sep" key={i} /> : (
                    <button key={it[0]} className="it" role="menuitem" onClick={() => { setMenu(false); menuAct[it[0]](); }}><Icon n={it[1]} />{it[2]}</button>
                  ))}
                </div>
              )}
              <button className="me" aria-haspopup="menu" onClick={() => setMenu(!menu)}>
                <div className="av">{(user.name || user.email).charAt(0).toUpperCase()}</div>
                <span className="who"><b>{user.email}</b><i>{left} of 20 free prompts left</i></span>
                <Icon n="up" />
              </button>
            </div>
          </>
        )}
      </aside>
  );
}

export default Sidebar;

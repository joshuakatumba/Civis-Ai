function Modal({ modal, setModal }) {
  return (
        <div className="ov" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="dlg" role="dialog" aria-modal="true">
            <h2>{modal.title}</h2>
            {modal.body}
            <div className="row">
              {modal.actions.map((a) => <button key={a.label} className={"btn" + (a.pri ? " pri" : "")} onClick={() => { setModal(null); a.fn && a.fn(); }}>{a.label}</button>)}
            </div>
          </div>
        </div>
  );
}

export default Modal;

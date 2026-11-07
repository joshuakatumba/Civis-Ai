import { KINDS, plain } from "../data/kinds.js";
const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, "_");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/* Browser-side stand-in. Real .docx must be rendered on the server so preview and file match. */
function downloadDoc(d) {
  const K = KINDS[d.kind];
  const body = `<h2 style="text-align:center">${esc(d.name.toUpperCase())}</h2>` + K.b.map(([h, p]) => (h ? `<h4>${h}</h4>` : "") + `<p>${esc(plain(p, d))}</p>`).join("");
  const html = `<html><head><meta charset="utf-8"></head><body>${body}</body></html>`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff", html], { type: "application/msword" }));
  a.download = slug(d.name) + ".doc";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export { slug, esc, downloadDoc };

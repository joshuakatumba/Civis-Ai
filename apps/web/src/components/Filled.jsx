import { valOf } from "../data/kinds.js";
function Filled({ p, d }) {
  return p.split(/(\{\w+\})/).map((s, i) => {
    const m = s.match(/^\{(\w+)\}$/);
    return m ? <span key={i} className="v">{valOf(d, m[1])}</span> : s;
  });
}

export default Filled;

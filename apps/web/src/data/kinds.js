/* Placeholder wording only. Real template text must come from reviewed legal content. */
const KINDS = {
  agreement: {
    f: [["a", "First party name", "Bright Builders Ltd"], ["aa", "First party address", "Plot 50, Ntinda Road, Kampala, Uganda"], ["b", "Second party name", "Grace Nakimera"], ["ba", "Second party address", "Plot 27, Jinja Road, Kampala, Uganda"], ["d1", "Effective date", "2026-12-01"], ["d2", "End date", "2027-03-01"], ["amt", "Amount", "UGX 5,000,000"], ["det", "Key terms", "The work will be completed within 90 days."], ["law", "Governing law", "Laws of the Republic of Uganda"]],
    b: [["PARTIES", "This {T} is made on {d1} between {a}, of {aa} (the \u201cFirst Party\u201d), and {b}, of {ba} (the \u201cSecond Party\u201d)."], ["TERM", "This agreement starts on {d1} and ends on {d2} unless it is ended earlier under its terms."], ["KEY TERMS", "{det}"], ["PAYMENT", "The agreed amount is {amt}. Payment is due as the parties agree in writing."], ["TERMINATION", "Either party may end this agreement by written notice if the other party breaks it and does not fix the problem within 14 days."], ["GOVERNING LAW", "This agreement is governed by the {law}."], ["SIGNATURES", "Signed by {a} and {b} on {d1}."]],
  },
  letter: {
    f: [["a", "Sender name", "Grace Nakimera"], ["aa", "Sender address", "Plot 27, Jinja Road, Kampala, Uganda"], ["b", "Recipient name", "Kevin Odoch"], ["ba", "Recipient address", "Plot 15, Kira Road, Kampala, Uganda"], ["d1", "Date", "2026-12-01"], ["sub", "Subject", "Subject of this document"], ["det", "Details", "Explain the matter clearly and what you want to happen."], ["d2", "Respond by", "2026-12-15"]],
    b: [["", "From: {a}, {aa}"], ["", "To: {b}, {ba}"], ["", "Date: {d1}"], ["SUBJECT", "{sub}"], ["", "Dear {b},"], ["", "{det}"], ["", "Please respond or act by {d2}."], ["", "Yours sincerely, {a}"]],
  },
  policy: {
    f: [["a", "Company name", "Bright Builders Ltd"], ["aa", "Company address", "Plot 50, Ntinda Road, Kampala, Uganda"], ["d1", "Effective date", "2026-12-01"], ["own", "Policy owner", "Kevin Odoch"], ["scope", "Who this applies to", "All employees, contractors and visitors"], ["det", "Key commitments", "We follow the law and treat everyone fairly and with respect."], ["em", "Contact email", "legal@brightbuilders.example"]],
    b: [["PURPOSE", "This {T} sets out how {a}, of {aa}, handles this matter."], ["SCOPE", "This policy applies to {scope}."], ["POLICY", "{det}"], ["RESPONSIBILITY", "{own} is responsible for this policy and for keeping it up to date."], ["EFFECTIVE DATE", "This policy takes effect on {d1}."], ["CONTACT", "Questions about this policy go to {em}."]],
  },
  declaration: {
    f: [["a", "Full name", "Grace Nakimera"], ["aa", "Address", "Plot 27, Jinja Road, Kampala, Uganda"], ["b", "Other person (agent, beneficiary or witness)", "Kevin Odoch"], ["ba", "Other person\u2019s address", "Plot 15, Kira Road, Kampala, Uganda"], ["d1", "Date", "2026-12-01"], ["det", "Statement or instructions", "State the facts or instructions you want recorded."], ["law", "Governing law", "Laws of the Republic of Uganda"]],
    b: [["DECLARATION", "I, {a}, of {aa}, make this {T} on {d1}."], ["OTHER PERSON", "This document names {b}, of {ba}."], ["DETAILS", "{det}"], ["GOVERNING LAW", "This document is governed by the {law}."], ["SIGNATURE", "Signed by {a} on {d1} in the presence of {b}."]],
  },
  court: {
    f: [["court", "Court name", "High Court of Uganda at Kampala"], ["cn", "Case number", "HCCS No. 123 of 2026"], ["a", "Claimant", "Grace Nakimera"], ["b", "Defendant", "Bright Builders Ltd"], ["d1", "Date", "2026-12-01"], ["det", "Facts", "Set out the facts of the case in order."], ["rel", "Relief sought", "Payment of UGX 5,000,000 and costs of the suit."]],
    b: [["COURT", "In the {court}, {cn}."], ["PARTIES", "Between {a} (Claimant) and {b} (Defendant)."], ["FACTS", "{det}"], ["RELIEF", "The Claimant asks the court for: {rel}"], ["DATE", "Dated {d1}."]],
  },
  finance: {
    f: [["a", "Payee name", "Bright Builders Ltd"], ["b", "Payer name", "Grace Nakimera"], ["d1", "Date", "2026-12-01"], ["amt", "Amount", "UGX 5,000,000"], ["det", "Description", "Payment for services provided"], ["pm", "Payment method", "Mobile money"]],
    b: [["DATE", "{d1}"], ["FROM", "{b}"], ["TO", "{a}"], ["AMOUNT", "{amt}"], ["FOR", "{det}"], ["PAYMENT METHOD", "{pm}"]],
  },
};

function kindOf(n, cat) {
  if (cat === "Notices & letters") return "letter";
  if (cat === "Company policies") return "policy";
  if (cat === "Affidavits, powers of attorney & family") return "declaration";
  if (cat === "Pleadings & court process" || cat === "Judgments & rulings") return "court";
  if (/Agreement|Assignment|Licence|Terms|Statement of Work/.test(n)) return "agreement";
  if (/Receipt|Invoice|IOU/.test(n)) return "finance";
  if (/Power of Attorney/.test(n)) return "declaration";
  if (/Letter|Notice|Form$|Handbook/.test(n)) return "letter";
  return "agreement";
}
const valOf = (d, k) => (k === "T" ? d.name : (d.vals[k] || "").trim() || "n/a");
const plain = (p, d) => p.replace(/\{(\w+)\}/g, (_, k) => valOf(d, k));

export { KINDS, kindOf, valOf, plain };

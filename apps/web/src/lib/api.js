const IDEAS = {
  research: ["What are my rights if I am dismissed without notice?", "Explain the main clauses in an NDA", "How long do I have to file a claim for unpaid wages?", "Trademark or copyright for my brand name?"],
};
const CANNED = {
  research: ["Here is how this usually works. The exact rules depend on where you are, so tell me the country or state and I can be more specific. Start by collecting the documents that relate to the issue, such as contracts, messages and receipts, and note the key dates.", "A sensible first step is to put your position in writing and keep a record of every exchange. From there the options are normally negotiation, mediation or a formal claim. If a deadline is close, speak to a licensed lawyer soon."],
  drafting: ["I can prepare this. Tell me who the parties are, the key dates and amounts, and any terms you want included. I will then write a full draft you can edit."],
};
/* SEAM: replace with POST /v1/conversations/{id}/messages (streaming). */
async function askCivis({ mode }) {
  await new Promise((r) => setTimeout(r, 1000));
  const list = CANNED[mode];
  return list[Math.floor(Math.random() * list.length)];
}

export { IDEAS, CANNED, askCivis };

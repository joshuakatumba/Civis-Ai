const TPL = {
  "Employment & workplace": ["Employment Contract Agreement", "Disciplinary Form", "Termination Letter", "Offer Letter", "Non-Compete Agreement", "Leave Request Form", "Internship Agreement", "Probation Letter", "Redundancy Notice", "Employee Handbook", "Resignation Letter"],
  "Property & tenancy": ["Lease Agreement", "Real Estate Property Power of Attorney", "Notice to Vacate", "Rent Receipt", "Property Sale Agreement"],
  "Sale, supply & commercial": ["Business Sale Agreement", "Supply Agreement", "Distribution Agreement", "Agency Agreement", "Purchase Order Terms"],
  "Professional services": ["Freelance Service Agreement", "Consulting Agreement", "Statement of Work", "Retainer Agreement"],
  "Notices & letters": ["Demand Letter", "Cease and Desist Letter", "Notice of Breach", "Formal Complaint Letter"],
  "Company policies": ["Anti-Bribery and Corruption Policy", "Anti-Money Laundering Policy", "Anti-Slavery Policy Statement", "Anti-Spam Policy", "Cell Phone Policy", "Clean Desk Policy", "Company Credit Card Policy", "Competition Terms & Conditions", "Cookie Policy", "Privacy Policy", "Code of Conduct", "Remote Work Policy", "Data Protection Policy", "Social Media Policy", "Whistleblowing Policy", "Health and Safety Policy", "Equal Opportunities Policy"],
  "Affidavits, powers of attorney & family": ["Affidavit of Support", "General Power of Attorney", "Will", "Child Custody Agreement"],
  "IP, media & licences": ["Software Licence Agreement", "Copyright Assignment", "Trademark Licence", "Photo Release Form"],
  "Finance, invoices & receipts": ["Invoice", "Loan Agreement", "Payment Receipt", "IOU Note"],
  "Judgments & rulings": ["Court Judgment"],
  "Pleadings & court process": ["Statement of Claim", "Statement of Defence", "Notice of Motion"],
};
const POP = ["Lease Agreement", "Employment Contract Agreement", "Court Judgment", "Real Estate Property Power of Attorney", "Business Sale Agreement", "Disciplinary Form"];
const catOf = (n) => Object.keys(TPL).find((c) => TPL[c].includes(n)) || "";

export { TPL, POP, catOf };

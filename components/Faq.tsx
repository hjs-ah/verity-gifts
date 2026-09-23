'use client';

import { useState, type ReactNode } from 'react';

/** An accordion item that slides open/closed (CSS grid-rows trick — no JS height math, no layout jump). */
export function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button type="button" className="faq-summary" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="faq-plus" aria-hidden="true">{open ? '\u2212' : '+'}</span>
        {question}
      </button>
      <div className="faq-panel" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="faq-panel-inner">{children}</div>
      </div>
    </div>
  );
}

export function Faq({ children }: { children: ReactNode }) {
  return <div className="faq" aria-label="About spiritual gifts">{children}</div>;
}

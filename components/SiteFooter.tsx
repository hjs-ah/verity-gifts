'use client';

import { useRef, type ReactNode } from 'react';

function InfoDialog({ id, title, label, children }: { id: string; title: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="footer-link" onClick={() => ref.current?.showModal()}>
        {label}
      </button>
      <dialog
        ref={ref}
        id={id}
        className="info-dialog"
        aria-labelledby={`${id}-title`}
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
      >
        <div className="info-dialog-head">
          <h2 id={`${id}-title`}>{title}</h2>
          <button type="button" className="info-dialog-close" aria-label="Close" onClick={() => ref.current?.close()}>
            &times;
          </button>
        </div>
        <div className="info-dialog-body">{children}</div>
      </dialog>
    </>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <span>&copy; {year} Verity Outreach Worship Center</span>
      <nav className="footer-links" aria-label="Legal">
        <InfoDialog id="privacy-policy" title="Privacy policy" label="Privacy policy">
          <p>
            This assessment saves your name and your answers to Verity Outreach Worship Center&rsquo;s ministry records, so your
            pastor and ministry leaders can see where your gifts might serve.
          </p>
          <p>
            If you add your email to get a copy of your results, we use it only to send that copy and to follow up with you about
            serving opportunities. We do not sell your information or share it with anyone outside the church.
          </p>
          <p>
            To review, correct, or remove your information, contact Verity Outreach Worship Center through{' '}
            <a href="https://vowcenter.com">vowcenter.com</a>.
          </p>
        </InfoDialog>
        <InfoDialog id="age-guidelines" title="Age guidelines" label="Age guidelines">
          <p>This assessment is intended for people ages 13 and up.</p>
          <p>If you are under 13, please complete it together with a parent or guardian.</p>
          <p>If you are 13&ndash;17, please get your parent or guardian&rsquo;s permission before entering your name or email.</p>
          <p>
            Verity Outreach Worship Center does not knowingly collect personal information from children under 13 without a
            parent or guardian&rsquo;s involvement.
          </p>
        </InfoDialog>
      </nav>
    </footer>
  );
}

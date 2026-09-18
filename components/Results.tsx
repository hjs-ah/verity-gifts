'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORY_MAP, GIFT_MAP, giftScripture } from '@/lib/gifts';
import type { Ministry } from '@/lib/ministries';
import { buildResults, type Answers } from '@/lib/scoring';

interface Props { first: string; last: string; answers: Answers; ministries: Ministry[]; onRetake: () => void }

const AI_ON = process.env.NEXT_PUBLIC_AI_SUMMARY === 'true';

export default function Results({ first, last, answers, ministries, onRetake }: Props) {
  const r = useMemo(() => buildResults(answers, ministries), [answers, ministries]);
  const cardRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Optional AI narrative. The built-in summary shows immediately and is replaced only if the AI one arrives.
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  useEffect(() => {
    if (!AI_ON) return;
    const cacheKey = `vow-gifts-summary:${r.gifts.map((g) => `${g.id}${g.score}`).join('')}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) { setAiSummary(cached); return; }
    } catch {}
    const ctrl = new AbortController();
    fetch('/api/summary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: first, answers }), signal: ctrl.signal,
    })
      .then((res) => res.json())
      .then((d: { summary: string | null }) => {
        if (d.summary) { setAiSummary(d.summary); try { sessionStorage.setItem(cacheKey, d.summary); } catch {} }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [r, first, answers]);

  // Email form
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('');
  const [followUp, setFollowUp] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = (new FormData(e.currentTarget).get('website') as string) ?? '';
    setSending(true); setStatus(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first, last, email, interest, wantsFollowUp: followUp, answers, website }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setStatus({ kind: 'ok', text: d.emailed ? 'Sent. Check your inbox for a copy of your results.' : 'Received. Someone from Verity will be in touch.' });
      else setStatus({ kind: 'err', text: d.error ?? 'Something went wrong. Please try again.' });
    } catch {
      setStatus({ kind: 'err', text: 'We could not reach the server. Check your connection and try again.' });
    } finally { setSending(false); }
  }

  async function download() {
    if (!cardRef.current) return;
    const { toPng } = await import('html-to-image');
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#fff';
    const url = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: bg });
    const a = document.createElement('a');
    a.href = url; a.download = `${first ? `${first}-` : ''}spiritual-gifts.png`; a.click();
  }

  return (
    <section aria-labelledby="results-title">
      <div className="card" ref={cardRef}>
        <h1 id="results-title" className="result-title">{first ? `${first}\u2019s top gifts` : 'Your top gifts'}</h1>
        <p className="result-sub">Spiritual Gifts Assessment, Verity Outreach Worship Center</p>

        <p className="summary">{aiSummary ?? r.summary}</p>
        {r.notes.map((n) => <p key={n} className="note">{n}</p>)}

        <h2 className="section-title">Where you are strongest</h2>
        <div className="top-list">
          {r.top.map((g) => {
            const gift = GIFT_MAP[g.id];
            return (
              <article key={g.id} className="top-item">
                <span className="rank" aria-label={`Number ${g.rank}`}>{g.rank}</span>
                <h3>{gift.name}{giftScripture(gift) ? <small>{giftScripture(gift)}</small> : null}</h3>
                <div className="score" aria-label={`${g.score} out of ${g.max}`}>{g.score}<span>/{g.max}</span></div>
                <div>
                  <p className="desc">{gift.tagline}</p>
                  <p className="cats">{gift.categories.map((c) => CATEGORY_MAP[c].name).join(' and ')}</p>
                </div>
              </article>
            );
          })}
        </div>

        <h2 className="section-title">Your gifting by group</h2>
        <div className="bars">
          {r.categories.map((c, i) => (
            <div key={c.id} className="bar-row wide">
              <b>{CATEGORY_MAP[c.id].name}</b>
              <div className="bar-track" role="img" aria-label={`${CATEGORY_MAP[c.id].name}: ${Math.round(c.strength * 100)} percent`}>
                <div className={`bar-fill${i === 0 ? ' primary' : ''}`} style={{ width: `${Math.max(4, c.strength * 100)}%`, animationDelay: `${i * 60}ms` }} />
              </div>
              <span className="n">{Math.round(c.strength * 100)}%</span>
            </div>
          ))}
        </div>

        {r.ministries.length > 0 ? (
          <>
          <h2 className="section-title">Where these gifts could serve</h2>
          <div className="tiles">
            {r.ministries.map((m) => (
              <div key={m.ministry.id} className="tile">
                <h3>{m.ministry.name}</h3>
                <p className="why">Fits your {m.because.map((id) => GIFT_MAP[id].name).join(', ')}</p>
                <p className="what">{m.ministry.blurb}</p>
                {m.ministry.href ? <a href={m.ministry.href}>Learn more</a> : null}
              </div>
            ))}
          </div>
          </>
        ) : null}

        <h2 className="section-title">Your full ranking</h2>
        <div className="bars">
          {r.gifts.map((g, i) => (
            <div key={g.id} className="bar-row">
              <b>{GIFT_MAP[g.id].name}</b>
              <div className="bar-track" role="img" aria-label={`${GIFT_MAP[g.id].name}: ${g.score} of ${g.max}`}>
                <div className={`bar-fill${g.tier === 'primary' ? ' primary' : ''}`}
                  style={{ width: `${Math.max(4, (g.score / g.max) * 100)}%`, animationDelay: `${i * 35}ms` }} />
              </div>
              <span className="n">{g.score}</span>
            </div>
          ))}
        </div>
        <p className="stamp">{today}. Your results are a starting point for conversation, not a final word on your calling.</p>
      </div>

      <div className="share">
        <h2>Want a copy in your inbox?</h2>
        <p>Your results are already saved with the Verity team. Add your email and we will send you a copy. If you would like, someone from Verity will follow up with you.</p>
        <form onSubmit={send}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="input" placeholder="you@email.com"
              autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {ministries.length > 0 ? (
            <div className="field">
              <label htmlFor="interest">Where are you most interested in serving?</label>
              <select id="interest" className="input" value={interest} onChange={(e) => setInterest(e.target.value)}>
                <option value="">Select an area (optional)</option>
                {ministries.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
          ) : null}
          <label className="check">
            <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} />
            <span>Yes, have someone from Verity follow up with me.</span>
          </label>
          <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div><button className="btn" type="submit" disabled={sending}>{sending ? 'Sending' : 'Email me my results'}</button></div>
          <p className="fine" style={{ margin: 0 }}>Your email is added to your saved results and shared with the Verity team.</p>
          {status ? <p className={`status${status.kind === 'err' ? ' err' : ''}`} role="status">{status.text}</p> : null}
        </form>
      </div>

      <div className="actions">
        <button className="btn ghost" onClick={download}>Download as image</button>
        <button className="btn ghost" onClick={onRetake}>Retake</button>
      </div>
    </section>
  );
}

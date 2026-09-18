'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORIES, GIFTS } from '@/lib/gifts';
import { cssUrl, type HeroSettings } from '@/lib/hero';
import type { Ministry } from '@/lib/ministries';
import { QUESTIONS, SCALE } from '@/lib/questions';
import type { Answers } from '@/lib/scoring';
import Results from './Results';
import ThemeToggle from './ThemeToggle';

type Stage = 'intro' | 'returning' | 'quiz' | 'results';
interface Saved { stage: Stage; first: string; last: string; index: number; answers: Answers }
interface Returning { completedAt: string | null; attempts: number; canView: boolean }

const STORAGE_KEY = 'vow-gifts-v2';
const TOTAL = QUESTIONS.length;
const MINUTES = Math.max(1, Math.round((TOTAL * 8) / 60)); // about 8 seconds a statement

const prettyDate = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'earlier';

export default function Assessment({ ministries, hero }: { ministries: Ministry[]; hero: HeroSettings }) {
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<Stage>('intro');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [returning, setReturning] = useState<Returning | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore progress so a refresh or a dropped connection does not cost anyone their answers.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        const complete = QUESTIONS.every((q) => Number.isInteger(s.answers?.[q.id]));
        if (s.stage === 'results' && complete) {
          setStage('results'); setFirst(s.first ?? ''); setLast(s.last ?? ''); setAnswers(s.answers);
        } else if (s.stage === 'quiz' && s.answers && Object.keys(s.answers).length > 0) {
          setStage('quiz'); setFirst(s.first ?? ''); setLast(s.last ?? ''); setAnswers(s.answers);
          setIndex(Math.min(Math.max(0, s.index ?? 0), TOTAL - 1));
        }
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (stage === 'intro' || stage === 'returning') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, first, last, index, answers } satisfies Saved));
    } catch {}
  }, [ready, stage, first, last, index, answers]);

  const logCompletion = useCallback(async (final: Answers) => {
    // Fire and forget, with one retry. The person's results never wait on this.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch('/api/complete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ first: first.trim(), last: last.trim(), answers: final }),
        });
        if (res.ok || res.status === 400 || res.status === 429) return;
      } catch {}
    }
  }, [first, last]);

  const choose = useCallback((value: number) => {
    const q = QUESTIONS[index];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (advance.current) clearTimeout(advance.current);
    advance.current = setTimeout(() => {
      if (index < TOTAL - 1) setIndex((i) => i + 1);
      else { setStage('results'); window.scrollTo({ top: 0 }); void logCompletion(next); }
    }, 220);
  }, [index, answers, logCompletion]);

  const back = useCallback(() => {
    if (advance.current) clearTimeout(advance.current);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Keys 1-5 answer, Left arrow goes back.
  useEffect(() => {
    if (stage !== 'quiz') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') choose(Number(e.key));
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, choose, back]);

  function beginQuiz() {
    setAnswers({}); setIndex(0); setNotice(null); setStage('quiz');
    window.scrollTo({ top: 0 });
  }

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null); setBusy(true);
    try {
      // Has this name completed the assessment before?
      const res = await fetch('/api/lookup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first: first.trim(), last: last.trim() }),
        signal: AbortSignal.timeout(6000),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.found) {
        setReturning({ completedAt: d.completedAt ?? null, attempts: d.attempts ?? 1, canView: Boolean(d.canView) });
        setStage('returning');
        return;
      }
    } catch {
      // If the check fails, never block someone from taking the assessment.
    } finally { setBusy(false); }
    beginQuiz();
  }

  async function viewEarlier() {
    setNotice(null); setBusy(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first: first.trim(), last: last.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.answers) { setAnswers(d.answers); setStage('results'); window.scrollTo({ top: 0 }); return; }
      setNotice(d.error ?? 'We could not load your earlier results. You can retake the assessment instead.');
    } catch {
      setNotice('We could not reach the server. Check your connection and try again.');
    } finally { setBusy(false); }
  }

  function startOver() {
    setAnswers({}); setIndex(0); setReturning(null); setNotice(null); setStage('intro');
    window.scrollTo({ top: 0 });
  }

  const q = QUESTIONS[index];
  const answered = Object.keys(answers).length;

  const topbar = (
    <header className="topbar">
      <div className="brand">
        <a className="brand-logo" href="https://vowcenter.com" aria-label="Verity Outreach Worship Center, vowcenter.com">
          <Image src="/logos/vow.png" alt="Verity Outreach Worship Center" width={602} height={287} priority style={{ height: 48, width: 'auto' }} />
        </a>
      </div>
      <ThemeToggle />
    </header>
  );
  const showHero = !ready || stage === 'intro';

  return (
    <main>
      {showHero ? (
        <section
          className={`hero${hero.imageUrl ? ' has-image' : ''}`}
          style={{ backgroundColor: hero.color, ...(hero.imageUrl ? { backgroundImage: cssUrl(hero.imageUrl) } : {}) }}
          aria-labelledby="intro-title"
        >
          <div className="hero-inner">
            {topbar}
            <h1 id="intro-title" className="hero-title">{hero.text}</h1>
          </div>
        </section>
      ) : null}
      <div className={`shell${showHero ? ' after-hero' : ''}`}>
      {showHero ? null : topbar}

      {!ready ? null : stage === 'intro' ? (
        <section className="intro">
          <p className="lede">
            This assessment helps you see how the Holy Spirit has gifted you and where those gifts can serve at Verity Outreach
            Worship Center. It follows the six groups of gifts our leadership teaches. Answer honestly, then use your results as the
            start of a conversation with your pastor.
          </p>

          <div className="faq" aria-label="About spiritual gifts">
            <details>
              <summary>What are spiritual gifts?</summary>
              <p>
                Spiritual gifts are abilities and graces the Holy Spirit gives to believers so the whole Body is built up. Scripture
                teaches that a manifestation of the Spirit is given to each person for the common good (1 Corinthians 12:7). A gift is
                never about status. It is God&rsquo;s provision for the people around you.
              </p>
            </details>
            <details>
              <summary>How are the gifts grouped here?</summary>
              <ul>
                {CATEGORIES.map((c) => (
                  <li key={c.id}><b>{c.title}</b>{c.scripture ? ` (${c.scripture})` : ''}. {c.blurb}</li>
                ))}
              </ul>
            </details>
            <details>
              <summary>How do I get the most from my results?</summary>
              <p>
                Answer by how you naturally show up, not how you wish you did. There are no right answers. Your results rank all {GIFTS.length} gifts,
                so look at your top few and the group they fall in. The ministry offices (Apostle, Prophet, Evangelist, Pastor) are recognized by
                church leadership, so take those to your pastor. Then try serving where your gifts point, and watch for fruit.
              </p>
            </details>
          </div>

          <div className="stats">
            <div className="stat"><b>{TOTAL}</b><span>statements</span></div>
            <div className="stat"><b>~{MINUTES}</b><span>minutes</span></div>
            <div className="stat"><b>{GIFTS.length}</b><span>gifts</span></div>
          </div>

          <form onSubmit={start} className="start-form">
            <div className="name-row">
              <div className="field">
                <label htmlFor="first-name">First name</label>
                <input id="first-name" className="input" value={first} maxLength={40} required autoComplete="given-name"
                  onChange={(e) => setFirst(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="last-name">Last name</label>
                <input id="last-name" className="input" value={last} maxLength={40} required autoComplete="family-name"
                  onChange={(e) => setLast(e.target.value)} />
              </div>
            </div>
            <button className="btn" type="submit" disabled={busy || !first.trim() || !last.trim()}>
              {busy ? 'One moment' : 'Start the assessment'}
            </button>
            <p className="fine">Your name and results are shared with the Verity ministry team.</p>
          </form>
        </section>
      ) : stage === 'returning' && returning ? (
        <section className="intro" aria-labelledby="back-title">
          <h1 id="back-title">Welcome back, {first.trim()}.</h1>
          <p className="lede">
            You completed this assessment on {prettyDate(returning.completedAt)}
            {returning.attempts > 1 ? ` and have taken it ${returning.attempts} times` : ''}.{' '}
            {returning.canView
              ? 'Would you like to see your earlier results or retake it?'
              : 'Your earlier results were saved under an older version of the questions, so we cannot show them. You can retake it to get current results.'}
          </p>
          <div className="actions">
            {returning.canView ? <button className="btn" onClick={viewEarlier} disabled={busy}>{busy ? 'One moment' : 'See my earlier results'}</button> : null}
            <button className="btn ghost" onClick={beginQuiz} disabled={busy}>Retake the assessment</button>
          </div>
          {notice ? <p className="status err" role="status" style={{ marginTop: '1rem' }}>{notice}</p> : null}
          <p className="fine">Retaking replaces your current results. Your earlier top gifts stay in the ministry&rsquo;s records.</p>
          <button className="link-btn" onClick={startOver}>Not {first.trim()}? Use a different name</button>
        </section>
      ) : stage === 'quiz' ? (
        <section aria-labelledby="statement">
          <div className="quiz-head">
            <span>Spiritual Gifts Assessment</span>
            <span><b>{index + 1}</b> of {TOTAL}</span>
          </div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={answered} aria-label="Progress">
            <i style={{ width: `${(answered / TOTAL) * 100}%` }} />
          </div>
          <h2 id="statement" className="statement">{q.text}</h2>
          <div className="options" role="radiogroup" aria-labelledby="statement">
            {SCALE.map((s) => (
              <button key={s.value} role="radio" aria-checked={answers[q.id] === s.value} className="option" onClick={() => choose(s.value)}>
                <span className="key" aria-hidden="true">{s.value}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <div className="quiz-foot">
            <button className="link-btn" onClick={back} disabled={index === 0}>Back</button>
            <span className="fine keyhint" style={{ margin: 0 }}>Tip: press 1 to 5 on your keyboard.</span>
          </div>
        </section>
      ) : (
        <Results first={first.trim()} last={last.trim()} answers={answers} ministries={ministries} onRetake={startOver} />
      )}
      </div>
    </main>
  );
}

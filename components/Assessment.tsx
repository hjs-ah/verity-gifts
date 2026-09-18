'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GIFTS } from '@/lib/gifts';
import { QUESTIONS, SCALE } from '@/lib/questions';
import type { Answers } from '@/lib/scoring';
import type { Ministry } from '@/lib/ministries';
import Results from './Results';
import ThemeToggle from './ThemeToggle';

type Stage = 'intro' | 'quiz' | 'results';
interface Saved { stage: Stage; name: string; index: number; answers: Answers }

const STORAGE_KEY = 'vow-gifts-v1';
const TOTAL = QUESTIONS.length;
const MINUTES = Math.max(1, Math.round((TOTAL * 8) / 60)); // about 8 seconds a statement

export default function Assessment({ ministries }: { ministries: Ministry[] }) {
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<Stage>('intro');
  const [name, setName] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore progress so a refresh or a dropped connection does not cost anyone their answers.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        const complete = QUESTIONS.every((q) => Number.isInteger(s.answers?.[q.id]));
        if (s.stage === 'results' && complete) {
          setStage('results'); setName(s.name ?? ''); setAnswers(s.answers);
        } else if (s.stage === 'quiz' && s.answers && Object.keys(s.answers).length > 0) {
          setStage('quiz'); setName(s.name ?? ''); setAnswers(s.answers);
          setIndex(Math.min(Math.max(0, s.index ?? 0), TOTAL - 1));
        }
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (stage === 'intro') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, name, index, answers } satisfies Saved));
    } catch {}
  }, [ready, stage, name, index, answers]);

  const choose = useCallback((value: number) => {
    const q = QUESTIONS[index];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    if (advance.current) clearTimeout(advance.current);
    advance.current = setTimeout(() => {
      if (index < TOTAL - 1) setIndex((i) => i + 1);
      else { setStage('results'); window.scrollTo({ top: 0 }); }
    }, 220);
  }, [index]);

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

  function start() {
    setAnswers({}); setIndex(0); setStage('quiz');
    window.scrollTo({ top: 0 });
  }

  function retake() {
    setAnswers({}); setIndex(0); setStage('intro');
    window.scrollTo({ top: 0 });
  }

  const q = QUESTIONS[index];
  const answered = Object.keys(answers).length;

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo">
            <Image src="/logos/vow.png" alt="Verity Outreach Worship Center" width={602} height={287} priority style={{ height: 48, width: "auto" }} />
          </span>
        </div>
        <ThemeToggle />
      </header>

      {!ready ? null : stage === 'intro' ? (
        <section className="intro" aria-labelledby="intro-title">
          <h1 id="intro-title">Discover how God has gifted you.</h1>
          <p className="lede">
            {TOTAL} short statements about how you naturally show up. There are no right answers, only honest ones.
          </p>
          <div className="stats">
            <div className="stat"><b>{TOTAL}</b><span>statements</span></div>
            <div className="stat"><b>~{MINUTES}</b><span>minutes</span></div>
            <div className="stat"><b>{GIFTS.length}</b><span>gifts</span></div>
          </div>
          <div className="field">
            <label htmlFor="first-name">Your first name (optional, shown on your results)</label>
            <input id="first-name" className="input" value={name} maxLength={40} autoComplete="given-name"
              placeholder="e.g. Alex" onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="btn" onClick={start}>Start the assessment</button>
          <p className="fine">Your answers stay in this browser until you choose to email your results.</p>
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
            <span className="fine" style={{ margin: 0 }}>Tip: press 1 to 5 on your keyboard.</span>
          </div>
        </section>
      ) : (
        <Results name={name} answers={answers} ministries={ministries} onRetake={retake} />
      )}
    </main>
  );
}

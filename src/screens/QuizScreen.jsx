import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'

// ─── Quiz data ────────────────────────────────────────────────
const QUIZ = [
  {
    q: "What did the Romans call London?",
    options: ["Londinium", "Londonium", "Britannia", "Tamesis"],
    correct: 0,
    explanation: "The Romans founded their settlement around 43 AD and named it Londinium. The exact origin of the word is still debated by historians two thousand years later.",
  },
  {
    q: "Which queen burned Roman London to the ground around 60 AD?",
    options: ["Boudicca", "Cleopatra", "Cartimandua", "Medb"],
    correct: 0,
    explanation: "Boudicca, queen of the Iceni tribe, razed Londinium in retaliation for the Roman seizure of her lands and the mistreatment of her daughters. The Romans rebuilt and carried on.",
  },
  {
    q: "What year did the Great Fire of London start?",
    options: ["1666", "1665", "1667", "1660"],
    correct: 0,
    explanation: "The Great Fire began on 2 September 1666 and burned for four days, destroying around 13,000 houses and 87 churches across the medieval City of London.",
  },
  {
    q: "On which street did the Great Fire begin?",
    options: ["Pudding Lane", "Bread Street", "Fish Street", "Thames Street"],
    correct: 0,
    explanation: "The fire started at Thomas Farriner's bakery on Pudding Lane in the early hours of Sunday morning. A single spark changed the entire city.",
  },
  {
    q: "What did Lord Mayor Bloodworth say when told about the fire?",
    options: [
      '"A woman might piss it out"',
      '"Call the army at once"',
      '"God save us all"',
      '"It will burn itself out"',
    ],
    correct: 0,
    explanation: "Bloodworth dismissed the fire and returned to bed. His failure to act in the crucial early hours is widely blamed for the disaster's scale. History has not been kind to him.",
  },
  {
    q: "Who designed the new St Paul's Cathedral after the Great Fire?",
    options: ["Christopher Wren", "Inigo Jones", "John Vanbrugh", "Nicholas Hawksmoor"],
    correct: 0,
    explanation: "Wren designed 52 London churches after the fire. St Paul's Cathedral, completed in 1710, is his masterpiece — and the one he's buried beneath.",
  },
  {
    q: "What is the Monument's height in feet?",
    options: ["202", "180", "220", "150"],
    correct: 0,
    explanation: "The Monument stands exactly 202 feet tall — precisely the distance from its base to the bakery on Pudding Lane where the fire began. The maths was deliberate.",
  },
  {
    q: "What caused the Great Plague of London?",
    options: [
      "Fleas on rats carrying Yersinia pestis",
      "Bad air rising from the Thames",
      "Contaminated water",
      "Foreign sailors",
    ],
    correct: 0,
    explanation: "The plague was caused by Yersinia pestis, transmitted via infected rat fleas. The prevailing theory at the time blamed 'bad air' — miasma. They were wrong, but the air was also genuinely terrible.",
  },
  {
    q: "How many people died in the Great Plague of London?",
    options: ["Around 100,000", "Around 50,000", "Around 200,000", "Around 10,000"],
    correct: 0,
    explanation: "Around 100,000 people died — roughly a quarter of London's entire population. Samuel Pepys documented the horror in his diary while somehow continuing to enjoy good dinners.",
  },
  {
    q: "What year was Londinium founded by the Romans?",
    options: ["43 AD", "55 BC", "410 AD", "100 AD"],
    correct: 0,
    explanation: "The Romans established Londinium around 43 AD following Claudius's invasion. Caesar's earlier raids in 55–54 BC made a lot of noise but left no permanent settlement.",
  },
]

const LETTERS      = ['A', 'B', 'C', 'D']
const XP_PER_RIGHT = 20
const TIMER_SECS   = 20

function shuffleQuestions(questions) {
  return questions.map(q => {
    const idx = [0, 1, 2, 3]
    for (let i = 3; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    return { ...q, options: idx.map(k => q.options[k]), correct: idx.indexOf(q.correct) }
  })
}

function perfMsg(score) {
  if (score === 10) return "Perfect score. London is yours."
  if (score >= 8)   return "Excellent. The city knows your name."
  if (score >= 6)   return "Solid. More history awaits."
  if (score >= 4)   return "Getting there. Keep exploring."
  return "London has much more to teach you."
}

// ─── Results screen ───────────────────────────────────────────
function Results({ answers, onDone }) {
  const score = answers.filter(Boolean).length
  const xp    = score * XP_PER_RIGHT

  return (
    <div className="quiz-results">
      <div className="sect-divider" style={{ padding: '0 0 20px' }}>
        <div className="sect-divider-line" />
        <span className="sect-divider-diamond">◆</span>
        <span className="sect-divider-label">Quiz Complete</span>
        <span className="sect-divider-diamond">◆</span>
        <div className="sect-divider-line" />
      </div>

      <div className="quiz-score-display">
        <span className="quiz-score-num">{score}</span>
        <span className="quiz-score-denom">/ {QUIZ.length}</span>
      </div>

      <p className="quiz-perf-msg">{perfMsg(score)}</p>

      <div className="quiz-xp-row">
        <span className="quiz-xp-label">XP Earned</span>
        <span className="quiz-xp-value">+{xp}</span>
      </div>

      <div className="quiz-dots">
        {answers.map((ok, i) => (
          <div key={i} className={`quiz-dot${ok ? ' quiz-dot--ok' : ' quiz-dot--fail'}`}>
            {ok ? '✓' : '✗'}
          </div>
        ))}
      </div>

      <button className="quiz-done-btn" onClick={() => onDone(score, xp)}>
        Done <ChevronRight size={13} />
      </button>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────
export default function QuizScreen({ onNavigate, onQuizComplete }) {
  const [shuffled]  = useState(() => shuffleQuestions(QUIZ))
  const [qIndex,    setQIndex]    = useState(0)
  const [phase,     setPhase]     = useState('question') // 'question'|'feedback'|'results'
  const [picked,    setPicked]    = useState(null)       // null | 0-3 | -1 (timeout)
  const [answers,   setAnswers]   = useState([])
  const [timeLeft,  setTimeLeft]  = useState(TIMER_SECS)
  const timerRef = useRef(null)

  // Countdown timer — restarts on each new question
  useEffect(() => {
    setTimeLeft(TIMER_SECS)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [qIndex])

  // Auto-wrong when timer hits 0
  useEffect(() => {
    if (timeLeft !== 0 || phase !== 'question') return
    setPicked(-1)
    setAnswers(prev => [...prev, false])
    setPhase('feedback')
  }, [timeLeft, phase])

  const q   = shuffled[qIndex]
  const pct = ((qIndex + (phase === 'feedback' ? 1 : 0)) / shuffled.length) * 100

  function pickAnswer(idx) {
    if (phase !== 'question') return
    clearInterval(timerRef.current)
    setPicked(idx)
    setAnswers(prev => [...prev, idx === q.correct])
    setPhase('feedback')
  }

  function next() {
    clearInterval(timerRef.current)
    if (qIndex < shuffled.length - 1) {
      setQIndex(i => i + 1)
      setPicked(null)
      setPhase('question')
    } else {
      setPhase('results')
    }
  }

  if (phase === 'results') {
    return (
      <div className="quiz-screen">
        <header className="quiz-header">
          <button className="quiz-back" onClick={() => onNavigate('quiz')} aria-label="Back">
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <span className="quiz-header-title">Tonight's Quiz</span>
        </header>
        <div className="quiz-content">
          <Results
            answers={answers}
            onDone={(score, xp) => {
              onQuizComplete(score, xp)
              onNavigate('quiz')
            }}
          />
          <div style={{ height: 32 }} />
        </div>
      </div>
    )
  }

  const timerPct = (timeLeft / TIMER_SECS) * 100
  const timerColor = timeLeft > 10 ? 'var(--gold)' : timeLeft > 5 ? 'var(--orange)' : '#c44444'

  const feedbackClass = picked === -1
    ? 'quiz-feedback--timeout'
    : picked === q.correct
      ? 'quiz-feedback--ok'
      : 'quiz-feedback--fail'

  return (
    <div className="quiz-screen">
      <header className="quiz-header">
        <button className="quiz-back" onClick={() => onNavigate('quiz')} aria-label="Back">
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <div className="quiz-progress-wrap">
          <div className="pbar-track quiz-pbar">
            <div className="pbar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="quiz-progress-label">{qIndex + 1} / {shuffled.length}</span>
        </div>
      </header>

      <div className="quiz-content">
        <p className="quiz-q-num">Question {qIndex + 1}</p>
        <h2 className="quiz-q-text">{q.q}</h2>

        <div className="quiz-timer-row">
          <div className="quiz-timer-track">
            <div
              className="quiz-timer-fill"
              style={{ width: `${timerPct}%`, background: timerColor }}
            />
          </div>
          <span className="quiz-timer-label">{timeLeft}s</span>
        </div>

        <div className="quiz-options">
          {q.options.map((opt, i) => {
            let extra = ''
            if (phase === 'feedback') {
              if (picked === -1) {
                extra = i === q.correct ? ' quiz-opt--reveal' : ' quiz-opt--dim'
              } else {
                if (i === q.correct && i === picked)             extra = ' quiz-opt--correct'
                else if (i === picked && i !== q.correct)        extra = ' quiz-opt--wrong'
                else if (i === q.correct && picked !== q.correct) extra = ' quiz-opt--reveal'
                else                                              extra = ' quiz-opt--dim'
              }
            }
            return (
              <button
                key={i}
                className={`quiz-option${extra}`}
                onClick={() => pickAnswer(i)}
                disabled={phase === 'feedback'}
              >
                <span className="quiz-opt-letter">{LETTERS[i]}</span>
                <span className="quiz-opt-text">{opt}</span>
                {phase === 'feedback' && i === q.correct && (
                  <span className="quiz-opt-mark quiz-opt-mark--ok">✓</span>
                )}
                {phase === 'feedback' && i === picked && i !== q.correct && (
                  <span className="quiz-opt-mark quiz-opt-mark--fail">✗</span>
                )}
              </button>
            )
          })}
        </div>

        {phase === 'feedback' && (
          <div className={`quiz-feedback ${feedbackClass}`}>
            <p className="quiz-feedback-verdict">
              {picked === -1
                ? "⏱  Time's up!"
                : picked === q.correct
                  ? '✓  Correct!'
                  : '✗  Incorrect'}
            </p>
            <p className="quiz-feedback-explanation">{q.explanation}</p>
            <button className="quiz-next-btn" onClick={next}>
              {qIndex < shuffled.length - 1 ? 'Next Question' : 'See Results'}
              <ChevronRight size={12} />
            </button>
          </div>
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}

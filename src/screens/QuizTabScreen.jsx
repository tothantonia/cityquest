import { HelpCircle, ChevronRight, Clock } from 'lucide-react'
import { isQuizAvailable, unlockCountdown } from '../utils/quizTime'

function SectionLabel({ children }) {
  return <p className="quiz-section-label">{children}</p>
}

function LockedCard() {
  const countdown = unlockCountdown()
  return (
    <div className="quiz-home-locked">
      <Clock size={20} strokeWidth={1.5} className="quiz-locked-icon" />
      <div className="quiz-locked-body">
        <span className="quiz-locked-title">Tonight's Quiz</span>
        <span className="quiz-locked-sub">
          {countdown ? `Unlocks in ${countdown}` : 'Available at 6 PM'}
        </span>
      </div>
    </div>
  )
}

function AvailableCard({ onStart }) {
  return (
    <div className="quiz-home-card" onClick={onStart}>
      <div className="quiz-home-accent" />
      <div className="quiz-home-body">
        <div className="quiz-home-top">
          <span className="quiz-home-tag">
            <HelpCircle size={9} strokeWidth={2} />
            Tonight's Quiz
          </span>
          <span className="xp-chip">⭑ 200 XP</span>
        </div>
        <p className="quiz-home-title">London History</p>
        <div className="quiz-home-footer">
          <span className="quiz-home-meta">10 questions · Multiple choice</span>
          <span className="quiz-home-cta">Start <ChevronRight size={10} /></span>
        </div>
      </div>
    </div>
  )
}

function CompletedCard({ entry }) {
  return (
    <div className="quiz-completed-card">
      <span className="quiz-completed-check">✓</span>
      <div className="quiz-completed-info">
        <p className="quiz-completed-title">London History — Completed</p>
        <div className="quiz-completed-chips">
          <span className="quiz-completed-score">{entry.score}/{entry.total}</span>
          <span className="quiz-completed-xp">+{entry.xp} XP earned</span>
        </div>
      </div>
    </div>
  )
}

function ArchiveItem({ entry }) {
  return (
    <div className="quiz-archive-item">
      <span className="quiz-archive-date">{entry.date}</span>
      <div className="quiz-archive-body">
        <p className="quiz-archive-title">London History Quiz</p>
        <div className="quiz-archive-meta">
          <span className="quiz-archive-score">{entry.score}/{entry.total} correct</span>
          <span className="quiz-archive-xp">+{entry.xp} XP</span>
        </div>
      </div>
    </div>
  )
}

export default function QuizTabScreen({ quizHistory, todayQuizDone, onNavigate, devQuizUnlocked }) {
  const available = isQuizAvailable() || devQuizUnlocked

  return (
    <div className="quiz-tab-screen">
      <header className="quiz-tab-header">
        <div className="home-title">
          <span className="home-title-diamond">⬥</span>
          <span className="home-title-text">QUIZ</span>
        </div>
      </header>

      <div className="quiz-tab-content">
        <SectionLabel>Tonight's Quiz</SectionLabel>

        {todayQuizDone && quizHistory.length > 0
          ? <CompletedCard entry={quizHistory[0]} />
          : !available
            ? <LockedCard />
            : <AvailableCard onStart={() => onNavigate('quizplay')} />
        }

        {quizHistory.length > 0 && (
          <>
            <SectionLabel>Past Quizzes</SectionLabel>
            {quizHistory.map((entry, i) => (
              <ArchiveItem key={i} entry={entry} />
            ))}
          </>
        )}

        <div style={{ height: 28 }} />
      </div>
    </div>
  )
}

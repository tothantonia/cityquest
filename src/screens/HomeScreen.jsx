import { useRef, useState } from 'react'
import { MapPin, ChevronRight, Star, HelpCircle, Clock } from 'lucide-react'
import { PLAYER, getDailyFact, NPCS, CAT, xpToLevel, levelXpBounds, CITIES } from '../data/gameData'
import { isQuizAvailable, unlockCountdown } from '../utils/quizTime'
import DevMenu from '../components/DevMenu'

// ─── Header ──────────────────────────────────────────────────
function Header({ playerXp, onDevTap, selectedCity }) {
  const tapCount = useRef(0)
  const tapTimer = useRef(null)

  function handleTitleTap() {
    tapCount.current += 1
    clearTimeout(tapTimer.current)
    if (tapCount.current >= 5) {
      tapCount.current = 0
      onDevTap()
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0 }, 2000)
    }
  }

  const level        = xpToLevel(playerXp)
  const { min, max } = levelXpBounds(level)
  const pct          = max != null ? ((playerXp - min) / (max - min)) * 100 : 100
  return (
    <header className="home-header">
      <div className="home-header-row">
        <div className="home-title" onClick={handleTitleTap}>
          <span className="home-title-diamond">⬥</span>
          <div>
            <span className="home-title-text">CITYQUEST</span>
            <span className="home-city-tag">
              <MapPin size={8} strokeWidth={2.5} />
              {CITIES.find(c => c.id === selectedCity)?.name || PLAYER.city}
            </span>
          </div>
        </div>
        <div className="home-header-right">
          <div className="home-level-badge">
            <span className="home-lvl-tag">LVL</span>
            <span className="home-lvl-num">{level}</span>
          </div>
          <span className="home-player-name">{PLAYER.name}</span>
        </div>
      </div>
      <div className="home-xp-row">
        <div className="pbar-track home-xp-bar">
          <div className="pbar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="home-xp-label">
          {max != null ? `${playerXp} / ${max} XP` : `${playerXp} XP`}
        </span>
      </div>
    </header>
  )
}

// ─── Daily lore card ──────────────────────────────────────────
function DailyLoreCard() {
  const fact = getDailyFact()
  return (
    <div className="lore-card">
      <span className="lore-card-tag">◆ {fact.tag}</span>
      <blockquote className="lore-card-body">{fact.body}</blockquote>
      <div className="lore-card-source">
        <div className="lore-source-line" />
        <span className="lore-source-text">{fact.source}</span>
        <div className="lore-source-line" />
      </div>
    </div>
  )
}

// ─── Quiz card ────────────────────────────────────────────────
function QuizCard({ onNavigate, todayQuizDone, devQuizUnlocked }) {
  if (todayQuizDone) return null

  const available = isQuizAvailable() || devQuizUnlocked
  const countdown = unlockCountdown()

  if (!available) {
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

  return (
    <div className="quiz-home-card" onClick={() => onNavigate('quizplay')}>
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

// ─── NPC contacts ─────────────────────────────────────────────
function NpcCard({ npc, onTap }) {
  const { Icon } = npc
  const tappable = !npc.locked && !!npc.intro && !!onTap
  if (npc.locked) {
    return (
      <div className="npc-card npc-card--locked">
        <div className="npc-avatar npc-avatar--locked">
          <span className="npc-avatar-q">?</span>
        </div>
        <span className="npc-name">???</span>
        <span className="npc-era">{npc.era}</span>
      </div>
    )
  }
  return (
    <div
      className={`npc-card${tappable ? ' npc-card--tappable' : ''}`}
      style={{ '--npc-color': npc.color }}
      onClick={tappable ? () => onTap(npc) : undefined}
    >
      <div className="npc-avatar" style={{ borderColor: `${npc.color}55`, color: npc.color }}>
        <Icon size={17} strokeWidth={1.5} />
      </div>
      <span className="npc-name">{npc.shortName}</span>
      <span className="npc-era">{npc.era}</span>
    </div>
  )
}

function NpcContacts({ onNpcTap }) {
  return (
    <div className="npc-section">
      <div className="sect-divider" style={{ padding: '18px 14px 8px' }}>
        <div className="sect-divider-line" />
        <span className="sect-divider-diamond">◆</span>
        <span className="sect-divider-label">Contacts</span>
        <span className="sect-divider-diamond">◆</span>
        <div className="sect-divider-line" />
      </div>
      <div className="npc-row">
        {NPCS.map(npc => <NpcCard key={npc.id} npc={npc} onTap={onNpcTap} />)}
      </div>
    </div>
  )
}

// ─── Stats row ────────────────────────────────────────────────
function StatsRow({ quests, playerXp }) {
  const completed = quests.filter(
    q => q.status === 'discovered' && q.tasks.length > 0 && q.tasks.every(t => t.done)
  ).length

  return (
    <div className="stats-row" style={{ margin: '18px 0 4px' }}>
      <div className="stat-card">
        <span className="stat-value">{playerXp}</span>
        <span className="stat-label">Total XP</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{completed}</span>
        <span className="stat-label">Quests Done</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{PLAYER.distanceToday}<small> km</small></span>
        <span className="stat-label">Today</span>
      </div>
    </div>
  )
}

// ─── Quest card (home) ────────────────────────────────────────
function HomeQuestCard({ quest, onGoToQuests }) {
  const cat  = CAT[quest.category]
  const done = quest.tasks.filter(t => t.done).length
  const total = quest.tasks.length
  const pct  = total > 0 ? (done / total) * 100 : 0

  return (
    <div className="quest-card" onClick={onGoToQuests} style={{ cursor: 'pointer' }}>
      <div className="quest-card-accent" style={{ background: cat.color }} />
      <div className="quest-card-body">
        <div className="quest-card-top">
          <h3 className="quest-card-title">{quest.title}</h3>
          <ChevronRight size={15} className="quest-card-chevron" />
        </div>
        <div className="quest-card-loc">
          <MapPin size={10} />
          <span>{quest.location}</span>
          <span style={{ color: 'var(--text-4)', marginLeft: 4 }}>· {quest.npc}</span>
        </div>
        <div className="quest-card-meta">
          <span className="quest-diff-badge" style={{ color: cat.color, borderColor: `${cat.color}66` }}>
            {cat.label}
          </span>
          <span className="quest-progress-text">{done} / {total} tasks</span>
          <span className="quest-xp">+{quest.xp} XP</span>
        </div>
        <div className="quest-card-pbar">
          <div className="pbar-track">
            <div
              className="pbar-fill"
              style={{
                width: `${pct}%`,
                background: cat.color,
                boxShadow: `0 0 6px ${cat.color}88`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section divider ──────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div className="sect-divider">
      <div className="sect-divider-line" />
      <span className="sect-divider-diamond">◆</span>
      <span className="sect-divider-label">{label}</span>
      <span className="sect-divider-diamond">◆</span>
      <div className="sect-divider-line" />
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────
export default function HomeScreen({ quests, onNavigate, onNpcTap, playerXp, todayQuizDone, devQuizUnlocked, onDevUnlockQuiz, onDevResetAll, onDevDiscoverAll, onDevAdd100Xp, selectedCity }) {
  const [devMenuOpen, setDevMenuOpen] = useState(false)
  const discovered = quests.filter(q => q.status === 'discovered')
  const inProgress = discovered.filter(q => q.tasks.some(t => t.done))
  const questsToShow = inProgress.length > 0 ? inProgress : discovered

  return (
    <div className="home-screen">
      <Header playerXp={playerXp} onDevTap={() => setDevMenuOpen(true)} selectedCity={selectedCity} />
      <div className="home-content">
        <DailyLoreCard />
        <QuizCard onNavigate={onNavigate} todayQuizDone={todayQuizDone} devQuizUnlocked={devQuizUnlocked} />
        <NpcContacts onNpcTap={onNpcTap} />
        <StatsRow quests={quests} playerXp={playerXp} />
        <SectionDivider label={inProgress.length > 0 ? 'Active Expeditions' : 'Available Expeditions'} />
        <div className="quest-cards">
          {questsToShow.map(q => (
            <HomeQuestCard
              key={q.id}
              quest={q}
              onGoToQuests={() => onNavigate('quests')}
            />
          ))}
        </div>
        <div style={{ height: 28 }} />
      </div>
      {devMenuOpen && (
        <DevMenu
          onClose={() => setDevMenuOpen(false)}
          onUnlockQuiz={   () => { onDevUnlockQuiz();    setDevMenuOpen(false) }}
          onResetAll={     () => { onDevResetAll();      setDevMenuOpen(false) }}
          onDiscoverAll={  () => { onDevDiscoverAll();   setDevMenuOpen(false) }}
          onAdd100Xp={     () => { onDevAdd100Xp();      setDevMenuOpen(false) }}
        />
      )}
    </div>
  )
}

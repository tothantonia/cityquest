import { useState } from 'react'
import { Lock, Coins, ChevronRight } from 'lucide-react'
import { PLAYER, CAT, xpToLevel, levelXpBounds } from '../data/gameData'

// ─── Static profile data ──────────────────────────────────────
const COINS = 0

const COMPLETED_QUESTS = []

const BADGES = [
  { id: 'first-steps',  name: 'First Steps'  },
  { id: 'city-whisper', name: 'City Whisper'  },
  { id: 'historian',    name: 'Historian'     },
]

const TABS = ['Stats', 'Quests', 'Badges']

// ─── Avatar ───────────────────────────────────────────────────
function AvatarSection() {
  return (
    <div className="profile-avatar-section">
      <div className="profile-avatar">
        <span className="profile-avatar-initial">{PLAYER.name[0]}</span>
      </div>
      <p className="profile-player-name">{PLAYER.name}</p>
      <button className="profile-customise-btn" disabled>Customise</button>
    </div>
  )
}

// ─── Level card ───────────────────────────────────────────────
function LevelCard({ playerXp }) {
  const level        = xpToLevel(playerXp)
  const { min, max } = levelXpBounds(level)
  const pct          = max != null ? ((playerXp - min) / (max - min)) * 100 : 100
  return (
    <div className="profile-level-card">
      <div className="profile-lvl-badge">
        <span className="profile-lvl-tag">LVL</span>
        <span className="profile-lvl-num">{level}</span>
      </div>
      <div className="profile-level-right">
        <div className="pbar-track" style={{ height: 6 }}>
          <div className="pbar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="profile-xp-label">
          {max != null ? `${playerXp} / ${max} XP` : `${playerXp} XP`}
        </span>
      </div>
    </div>
  )
}

// ─── Coins ────────────────────────────────────────────────────
function CoinsRow() {
  return (
    <div className="profile-coins-row">
      <Coins size={15} strokeWidth={1.75} color="var(--gold)" />
      <span className="profile-coins-value">{COINS}</span>
      <span className="profile-coins-label">Coins</span>
    </div>
  )
}

// ─── Stats tab ────────────────────────────────────────────────
function StatsTab({ playerXp }) {
  return (
    <div className="profile-stats">
      <p className="profile-section-label">Cities Visited</p>
      <div className="profile-city-item">
        <span className="profile-city-flag">🇬🇧</span>
        <span className="profile-city-name">London</span>
        <span className="profile-city-tag">1 city</span>
      </div>

      <p className="profile-section-label" style={{ marginTop: 20 }}>Statistics</p>
      <div className="profile-stat-grid">
        <div className="profile-stat-card">
          <span className="profile-stat-value">{playerXp}</span>
          <span className="profile-stat-label">Total XP</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-value">{COMPLETED_QUESTS.length}</span>
          <span className="profile-stat-label">Quests Done</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-value">2</span>
          <span className="profile-stat-label">Lore Collected</span>
        </div>
      </div>
    </div>
  )
}

// ─── Quests tab ───────────────────────────────────────────────
function QuestsTab() {
  return (
    <div className="profile-quests">
      {COMPLETED_QUESTS.map(q => {
        const cat = CAT[q.category]
        return (
          <div key={q.id} className="profile-quest-item">
            <div className="profile-quest-accent" style={{ background: cat?.color }} />
            <div className="profile-quest-body">
              <span className="profile-quest-title">{q.title}</span>
              <div className="profile-quest-meta">
                {cat && (
                  <span
                    className="cat-badge"
                    style={{ color: cat.color, borderColor: `${cat.color}44`, background: `${cat.color}14` }}
                  >
                    <cat.Icon size={8} strokeWidth={2} />
                    {cat.label}
                  </span>
                )}
                <span className="profile-quest-xp">+{q.xp} XP</span>
                <span className="profile-quest-date">{q.date}</span>
              </div>
            </div>
            <span className="profile-quest-check">✓</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Badges tab ───────────────────────────────────────────────
function BadgesTab() {
  return (
    <div className="profile-badges">
      {BADGES.map(b => (
        <div key={b.id} className="profile-badge-card">
          <div className="profile-badge-icon">
            <Lock size={20} strokeWidth={1.5} color="var(--text-4)" />
          </div>
          <span className="profile-badge-name">{b.name}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Subscription card ────────────────────────────────────────
function SubscriptionCard() {
  return (
    <div className="profile-sub-card">
      <div className="profile-sub-left">
        <span className="profile-sub-tier">◆ FREE EXPLORER</span>
        <p className="profile-sub-desc">Unlock more cities, quests and stories</p>
      </div>
      <button className="profile-upgrade-btn">
        Upgrade <ChevronRight size={12} />
      </button>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────
export default function ProfileScreen({ playerXp }) {
  const [activeTab, setActiveTab] = useState('Stats')

  return (
    <div className="profile-screen">
      <header className="profile-header">
        <div className="home-title">
          <span className="home-title-diamond">⬥</span>
          <span className="home-title-text">PROFILE</span>
        </div>
      </header>

      <div className="profile-content">
        <AvatarSection />

        <div className="profile-cards-row">
          <LevelCard playerXp={playerXp} />
          <CoinsRow />
        </div>

        <div className="profile-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`profile-tab-btn${activeTab === t ? ' profile-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="profile-tab-panel">
          {activeTab === 'Stats'  && <StatsTab playerXp={playerXp} />}
          {activeTab === 'Quests' && <QuestsTab />}
          {activeTab === 'Badges' && <BadgesTab />}
        </div>

        <SubscriptionCard />
        <div style={{ height: 28 }} />
      </div>
    </div>
  )
}

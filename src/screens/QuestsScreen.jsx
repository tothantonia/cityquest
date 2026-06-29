import { useState } from 'react'
import { MapPin, Lock, ArrowLeft, User, ChevronRight } from 'lucide-react'
import { CAT } from '../data/gameData'

// ─── Shared chips ─────────────────────────────────────────────
function CategoryBadge({ category, dim = false }) {
  const { color, label, Icon } = CAT[category]
  return (
    <span
      className="cat-badge"
      style={
        dim
          ? { color: 'var(--text-4)', borderColor: 'var(--text-4)', background: 'transparent' }
          : { color, borderColor: `${color}44`, background: `${color}14` }
      }
    >
      <Icon size={9} strokeWidth={2} />
      {label}
    </span>
  )
}

function XpChip({ xp }) {
  return <span className="xp-chip">⭑ {xp} XP</span>
}

function DistChip({ distance }) {
  return (
    <span className="dist-chip">
      <MapPin size={9} strokeWidth={2} />
      {distance}
    </span>
  )
}

// ─── Discovered quest list card ───────────────────────────────
function DiscoveredCard({ quest, onSelect }) {
  const cat    = CAT[quest.category]
  const done   = quest.tasks.filter(t => t.done).length
  const total  = quest.tasks.length
  const pct    = total > 0 ? (done / total) * 100 : 0
  const complete = done === total && total > 0

  return (
    <div className="qlist-card" onClick={() => onSelect(quest.id)}>
      <div className="qlist-card-accent" style={{ background: cat.color }} />
      <div className="qlist-card-body">
        <div className="qlist-card-top">
          <CategoryBadge category={quest.category} />
          <div className="qlist-card-chips">
            <XpChip xp={quest.xp} />
            <DistChip distance={quest.distance} />
          </div>
        </div>
        <h3 className="qlist-card-title">{quest.title}</h3>
        <div className="qlist-card-npc">
          <User size={10} strokeWidth={2} />
          <span>{quest.npc}</span>
        </div>
        <div className="qlist-card-progress">
          <div className="qlist-card-progress-row">
            <div className="pbar-track" style={{ flex: 1 }}>
              <div
                className="pbar-fill"
                style={{
                  width: `${pct}%`,
                  background: complete ? '#5cb87a' : cat.color,
                  boxShadow: `0 0 6px ${complete ? '#5cb87a' : cat.color}88`,
                }}
              />
            </div>
            <span className="qlist-card-progress-label">
              {complete ? '✓ Complete' : `${done} / ${total} tasks`}
            </span>
          </div>
        </div>
      </div>
      <ChevronRight size={15} className="qlist-card-chevron" />
    </div>
  )
}

// ─── Locked mystery card ──────────────────────────────────────
function MysteryCard({ quest }) {
  return (
    <div className="mystery-card">
      <div className="mystery-top">
        <CategoryBadge category={quest.category} dim />
        <div className="mystery-xp-blur" />
      </div>
      <div className="mystery-bars">
        <div className="mystery-bar mystery-bar--long" />
        <div className="mystery-bar mystery-bar--short" />
      </div>
      <p className="mystery-hint">"{quest.hint}"</p>
      <div className="mystery-footer">
        <MapPin size={9} strokeWidth={2} />
        <span>Discover this location to unlock</span>
      </div>
    </div>
  )
}

// ─── Task item ────────────────────────────────────────────────
function TaskItem({ task, catColor, onToggle }) {
  return (
    <div
      className={`task-item${task.done ? ' task-item--done' : ''}`}
      onClick={onToggle}
      style={{ '--cat-color': catColor }}
    >
      <div className="task-check">
        {task.done && <span className="task-check-mark">◆</span>}
      </div>
      <span className="task-text">{task.text}</span>
    </div>
  )
}

// ─── Quest detail view ────────────────────────────────────────
function QuestDetail({ quest, onBack, onToggleTask }) {
  const cat      = CAT[quest.category]
  const done     = quest.tasks.filter(t => t.done).length
  const total    = quest.tasks.length
  const pct      = total > 0 ? (done / total) * 100 : 0
  const complete = done === total && total > 0

  return (
    <div className="qdetail">
      <div className="qdetail-header" style={{ borderBottomColor: `${cat.color}33` }}>
        <button className="qdetail-back" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <CategoryBadge category={quest.category} />
        <XpChip xp={quest.xp} />
      </div>

      <div className="qdetail-content">
        <div className="qdetail-title-block" style={{ borderLeftColor: cat.color }}>
          <h1 className="qdetail-title">{quest.title}</h1>
          <div className="qdetail-location">
            <MapPin size={11} strokeWidth={2} />
            <span>{quest.location}</span>
            <span className="qdetail-dist">{quest.distance} away</span>
          </div>
        </div>

        <div className="qdetail-flavor" style={{ borderLeftColor: `${cat.color}55` }}>
          <p>{quest.flavor}</p>
        </div>

        <div className="qdetail-npc">
          <div className="qdetail-npc-avatar" style={{ borderColor: `${cat.color}55`, color: cat.color }}>
            <User size={16} strokeWidth={1.5} />
          </div>
          <div className="qdetail-npc-body">
            <span className="qdetail-npc-name">{quest.npc}</span>
            <blockquote className="qdetail-npc-quote">"{quest.npcQuote}"</blockquote>
          </div>
        </div>

        <div className="qdetail-progress-card">
          <div className="qdetail-progress-header">
            <span className="qdetail-progress-lbl">Progress</span>
            <span className="qdetail-progress-frac" style={{ color: complete ? 'var(--green)' : cat.color }}>
              {done} / {total}
            </span>
          </div>
          <div className="pbar-track" style={{ height: 7 }}>
            <div
              className="pbar-fill"
              style={{
                width: `${pct}%`,
                background: complete ? 'var(--green)' : cat.color,
                boxShadow: `0 0 10px ${complete ? '#5cb87a' : cat.color}88`,
              }}
            />
          </div>
          {complete && (
            <p className="qdetail-complete-msg" style={{ color: cat.color }}>
              ◆ Quest Complete — Claim Your Reward ◆
            </p>
          )}
        </div>

        <div className="sect-divider" style={{ padding: '20px 0 8px' }}>
          <div className="sect-divider-line" />
          <span className="sect-divider-diamond">◆</span>
          <span className="sect-divider-label">Objectives</span>
          <span className="sect-divider-diamond">◆</span>
          <div className="sect-divider-line" />
        </div>

        <div className="task-list">
          {quest.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              catColor={cat.color}
              onToggle={() => onToggleTask(task.id)}
            />
          ))}
        </div>

        <div className="qdetail-reward" style={{ borderColor: `${cat.color}33` }}>
          <span className="qdetail-reward-lbl">◆ Reward</span>
          <span className="qdetail-reward-xp" style={{ color: cat.color }}>+{quest.xp} XP</span>
        </div>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────
export default function QuestsScreen({ quests, toggleTask }) {
  const [selectedId, setSelectedId] = useState(null)

  const selected    = quests.find(q => q.id === selectedId) ?? null
  const discovered  = quests.filter(q => q.status === 'discovered')
  const locked      = quests.filter(q => q.status === 'locked')

  const totalDone   = discovered.reduce((n, q) => n + q.tasks.filter(t => t.done).length, 0)
  const totalTasks  = discovered.reduce((n, q) => n + q.tasks.length, 0)

  if (selected) {
    return (
      <QuestDetail
        quest={selected}
        onBack={() => setSelectedId(null)}
        onToggleTask={taskId => toggleTask(selected.id, taskId)}
      />
    )
  }

  return (
    <div className="quests-screen">
      <div className="quests-header">
        <div className="quests-header-row">
          <div className="home-title">
            <span className="home-title-diamond">⬥</span>
            <span className="home-title-text">QUESTS</span>
          </div>
          <span className="quests-task-count">{totalDone} / {totalTasks} tasks</span>
        </div>
      </div>

      <div className="qlist">
        {/* Discovered quests */}
        {discovered.map(q => (
          <DiscoveredCard key={q.id} quest={q} onSelect={setSelectedId} />
        ))}

        {/* Mystery silhouettes */}
        {locked.length > 0 && (
          <div className="mystery-divider">
            <div className="mystery-divider-line" />
            <span className="mystery-divider-label">Rumours & Shadows</span>
            <div className="mystery-divider-line" />
          </div>
        )}
        {locked.map(q => (
          <MysteryCard key={q.id} quest={q} />
        ))}

        <div style={{ height: 28 }} />
      </div>
    </div>
  )
}

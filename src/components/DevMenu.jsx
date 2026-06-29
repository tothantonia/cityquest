const overlay = {
  position: 'fixed',
  bottom: 76,
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#1c1810',
  border: '1px solid #d97c48',
  borderRadius: 8,
  padding: '12px 14px',
  zIndex: 9999,
  minWidth: 220,
  boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
}

const btn = {
  display: 'block',
  width: '100%',
  background: 'rgba(217,124,72,0.12)',
  border: '1px solid rgba(217,124,72,0.35)',
  color: '#d97c48',
  borderRadius: 5,
  padding: '9px 12px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'left',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const dangerBtn = {
  ...btn,
  background: 'rgba(200,50,50,0.1)',
  border: '1px solid rgba(200,50,50,0.35)',
  color: '#c44',
}

export default function DevMenu({ onUnlockQuiz, onResetAll, onDiscoverAll, onAdd100Xp, onClose }) {
  return (
    <div style={overlay}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: '#d97c48', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'system-ui, sans-serif' }}>
          ◆ DEV MENU
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#7a6040', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <button style={btn} onClick={onUnlockQuiz}>Unlock quiz now</button>
        <button style={btn} onClick={onDiscoverAll}>Discover all nearby quests</button>
        <button style={btn} onClick={onAdd100Xp}>Add 100 XP</button>
        <button style={dangerBtn} onClick={onResetAll}>Reset all progress</button>
      </div>
    </div>
  )
}

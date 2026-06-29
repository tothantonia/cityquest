import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

// ─── Intro cinematic ──────────────────────────────────────────
function IntroPhase({ npc, onContinue }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t) }, [])

  const NpcIcon = npc.Icon

  return (
    <div className={`npc-intro${visible ? ' npc-intro--in' : ''}`}>

      <div className="npc-intro-frame" style={{ background: npc.portraitBg }}>
        {/* Era divider at top */}
        <div className="npc-intro-era-row">
          <div className="npc-intro-era-line" />
          <span className="npc-intro-era-text">◆ {npc.era} ◆</span>
          <div className="npc-intro-era-line" />
        </div>

        {/* Icon centered in portrait */}
        <div className="npc-intro-icon-wrap">
          <NpcIcon size={108} color={npc.color} strokeWidth={0.7} />
        </div>

        {/* Radial depth vignette */}
        <div className="npc-intro-vignette" />

        {/* Bottom gradient + name */}
        <div className="npc-intro-bottom-grad" />
        <div className="npc-intro-namebox">
          <h2 className="npc-intro-name" style={{ color: npc.color }}>{npc.name}</h2>
          <p className="npc-intro-npc-title">{npc.title}</p>
        </div>

        {/* Border overlay (so border appears on top of portrait fill) */}
        <div className="npc-intro-border-overlay" />
      </div>

      {/* Monologue text box */}
      <div className="npc-intro-textbox">
        <p className="npc-intro-monologue">"{npc.intro}"</p>
        <button
          className="npc-intro-continue-btn"
          style={{ color: npc.color, borderColor: `${npc.color}55` }}
          onClick={onContinue}
        >
          Continue <ChevronRight size={13} />
        </button>
      </div>

    </div>
  )
}

// ─── Visual novel dialogue ────────────────────────────────────
function DialoguePhase({ npc, onComplete }) {
  const [reply,   setReply]   = useState(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t) }, [])

  const NpcIcon = npc.Icon

  function pick(r) {
    if (r.reply) setReply(r.reply)
    else         onComplete()
  }

  return (
    <div className={`npc-dialogue${visible ? ' npc-dialogue--in' : ''}`}>

      {/* NPC header row */}
      <div className="npc-dialogue-hdr">
        <div className="npc-dialogue-portrait" style={{ background: npc.portraitBg, borderColor: `${npc.color}55` }}>
          <NpcIcon size={38} color={npc.color} strokeWidth={1} />
        </div>
        <div className="npc-dialogue-hdr-info">
          <span className="npc-dialogue-npc-name" style={{ color: npc.color }}>{npc.name}</span>
          <span className="npc-dialogue-npc-era">{npc.era}</span>
        </div>
      </div>

      {/* Dialogue text box */}
      <div className="npc-dialogue-box" style={{ borderColor: `${npc.color}30` }}>
        <p className="npc-dialogue-text">"{reply ?? npc.dialogueLine}"</p>
      </div>

      {/* Response options or Begin Quest */}
      <div className="npc-dialogue-responses">
        {!reply ? (
          npc.responses?.map(r => (
            <button
              key={r.id}
              className="npc-dialogue-response"
              style={{ '--npc-c': npc.color }}
              onClick={() => pick(r)}
            >
              <span className="npc-resp-arrow">▷</span>
              {r.text}
            </button>
          ))
        ) : (
          <button
            className="npc-intro-continue-btn"
            style={{ color: npc.color, borderColor: `${npc.color}55` }}
            onClick={onComplete}
          >
            Begin Quest <ChevronRight size={13} />
          </button>
        )}
      </div>

    </div>
  )
}

// ─── Scene root ───────────────────────────────────────────────
export default function NpcScene({ npc, onComplete }) {
  const [phase, setPhase] = useState('intro')

  return (
    <div className="npc-scene">
      {phase === 'intro'    && <IntroPhase    npc={npc} onContinue={() => setPhase('dialogue')} />}
      {phase === 'dialogue' && <DialoguePhase npc={npc} onComplete={onComplete} />}
    </div>
  )
}

import { useState } from 'react'
import { ArrowLeft, Lock, ChevronRight } from 'lucide-react'

// ─── Chapter data ─────────────────────────────────────────────
const CHAPTERS = [
  {
    id: 1,
    year: '43 AD',
    title: 'The Romans Rock Up',
    initialState: 'read',
    lore: `In 43 AD, Emperor Claudius decided Britain needed to be Roman. Not asked. Not consulted. Just Roman. He dispatched four legions — roughly 40,000 soldiers — across the Channel to a rainy island full of people who painted themselves blue and had apparently been managing just fine without aqueducts.

The invasion went embarrassingly well. The native Britons, led by various warlords with increasingly unpronounceable names, put up a fight. Roman discipline and engineering tended to win arguments. Within a few months, Rome had crossed the Thames and started building.

They called the place Londinium. Nobody knows exactly what that word meant. Linguists have been arguing about it for two thousand years and show no signs of stopping.

The Romans built a bridge, laid a road grid, and constructed walls — because if there's one thing Romans couldn't resist, it was a good wall. Londinium grew fast. Within decades it had a forum, a basilica, a governor's palace, and multiple competing opinions about the best road to Colchester.

It also had Boudica. In 60 AD, the queen of the Iceni tribe burned the whole city to the ground in a blaze of entirely justified fury after the Romans seized her land and mistreated her daughters. The Romans rebuilt, added another layer of walls, and filed the incident under "lessons learned."

Londinium flourished for another 350 years. By 200 AD it had 30,000 residents, the largest amphitheatre in Roman Britain, and the kind of confident infrastructure that makes archaeologists emotional. Then, slowly, Rome started having problems of its own. In 410 AD, the emperor told Britain it was on its own. The legions left. The lights stayed on for a while. Then, gradually, they didn't.`,
  },
  {
    id: 2,
    year: '449 AD',
    title: 'The Angles, Saxons and Jutes Arrived',
    initialState: 'read',
    lore: `Rome left Britain in 410 AD and didn't leave a forwarding address. One day there were legions, administrators, underfloor heating, and a functioning tax system. Then there weren't. Britain was left holding a collection of crumbling roads, cooling bath houses, and a fairly significant identity crisis.

Into this void came the Angles, the Saxons, and the Jutes — three Germanic tribes from what is now Denmark and northern Germany. They didn't arrive with a formal announcement. Some came as mercenaries, hired by post-Roman British leaders to help with defence. The plan, in retrospect, had a flaw. The mercenaries noticed that the island was quite nice and the remaining Britons were quite disorganised, and adjusted their plans accordingly.

By the mid-5th century, the migration had become a mass settlement. The newcomers spoke Old English, worshipped Germanic gods, and had strong opinions about mead.

Here's the thing about Roman Londinium: the Anglo-Saxons essentially ignored it. The old city — forum, basilica, and all — sat largely abandoned. They found walled Roman cities unsettling, possibly haunted, definitely impractical. Instead, they built Lundenwic just outside the old walls, around what is now Covent Garden and the Strand. A thriving market town of timber buildings and busy wharfs.

It wasn't called London yet. It wasn't called England yet. But the language being spoken, the culture being built, and the place names being coined were all becoming recognisably, stubbornly, English. The Romans got the infrastructure. The Anglo-Saxons got the island.`,
  },
  {
    id: 3,
    year: '500–850 AD',
    title: 'Seven Kingdoms, Zero Chill',
    initialState: 'unread',
    lore: `After Rome left and before anyone had figured out what England was, Britain ran on chaos and competing claims to very small amounts of territory. The result was the Heptarchy — seven Anglo-Saxon kingdoms existing simultaneously, each convinced it was the important one.

The kingdoms were Northumbria, Mercia, East Anglia, Essex, Kent, Sussex, and Wessex. They overlapped, merged, fought, allied, split, fought again, and generally behaved like seven housemates sharing one bathroom and zero communication skills.

The dominant power shifted constantly. Northumbria had a strong early run, becoming a centre of Christian scholarship. The monastery at Lindisfarne produced the Lindisfarne Gospels — one of the most beautiful books ever made — while simultaneously being, geographically, an extremely unfortunate target for anyone arriving by longship. More on that later.

Then Mercia under King Offa became the main force in the 8th century. Offa was effective, ambitious, and built a 177-mile earthwork along the Welsh border that still bears his name. He also called himself "King of the English," which was optimistic given that at least six other kingdoms had opinions about that.

Then Wessex began its slow ascent.

London — called Lundenwic by this point — sat in the middle of all this as a prize that changed hands depending on who was currently winning. It passed between Mercia and Wessex multiple times. Being strategically important turns out to be a mixed blessing.

The Heptarchy never formally ended. It dissolved into something worse: the arrival of an external problem large enough to briefly unite everybody.`,
  },
  {
    id: 4,
    year: '793 AD',
    title: 'The Vikings Entered the Chat',
    initialState: 'unread',
    lore: `It started, as many disasters do, on a perfectly ordinary morning.

On 8 June 793 AD, longships appeared off the coast of Lindisfarne — a small holy island off the Northumbrian coast, home to one of England's most important monasteries. The monks had no warning, no defences, and no realistic plan for this scenario. The Vikings looted the treasury, killed several monks, threw others into the sea, and left.

The rest of England was appalled. Alcuin, a Northumbrian scholar working at Charlemagne's court, wrote that nothing like this had happened since the Romans. He was right, but also completely wrong about the implications.

Because this was not a one-off. Raids on coastal monasteries became a pattern. Monasteries were popular targets: wealthy, relatively undefended, close to the water, and full of people who had taken vows that made armed resistance theologically complicated.

By the 830s, the raids had shifted south. London was attacked in 842 and again in 851. The 851 assault was particularly serious — the Vikings overwintered in England for the first time, which meant they weren't just raiding anymore.

The Great Heathen Army arrived in 865. It wasn't a raiding party. It was an invasion force, and it worked. Within a few years the Vikings had taken Northumbria, East Anglia, and most of Mercia. Wessex was all that remained.

It fell to one king, hiding in a Somerset swamp, to work out what to do next. That story involves burned cakes, a dramatic comeback, and the closest England ever came to being entirely Danish.`,
  },
  { id: 5,  year: '865–954 AD', title: 'The Danelaw',                               initialState: 'locked' },
  { id: 6,  year: '878 AD',     title: 'Alfred Hid in a Swamp and Saved England',    initialState: 'locked' },
  { id: 7,  year: '991 AD',     title: 'The Battle of Maldon',                       initialState: 'locked' },
  { id: 8,  year: '1016 AD',    title: 'Cnut the Great',                             initialState: 'locked' },
  { id: 9,  year: '1066 AD',    title: 'Battle of Stamford Bridge',                  initialState: 'locked' },
  { id: 10, year: '1066 AD',    title: 'Battle of Hastings',                         initialState: 'locked' },
  { id: 11, year: '1066–1100 AD', title: 'The Norman Conquest',                      initialState: 'locked' },
  { id: 12, year: '1265 AD',    title: 'The First Parliament',                       initialState: 'locked' },
  { id: 13, year: '1665 AD',    title: 'The Great Plague',                           initialState: 'locked' },
  { id: 14, year: '1666 AD',    title: 'The Great Fire of London',                   initialState: 'locked' },
]

const TOTAL    = CHAPTERS.length
const UNLOCKED = CHAPTERS.filter(c => c.initialState !== 'locked').length

// ─── Chapter card ─────────────────────────────────────────────
function ChapterCard({ chapter, readIds, onOpen }) {
  const isLocked  = chapter.initialState === 'locked'
  const isRead    = readIds.has(chapter.id)
  const isUnread  = !isLocked && !isRead

  return (
    <div
      className={`chapter-card${isLocked ? ' chapter-card--locked' : ''}${isUnread ? ' chapter-card--unread' : ''}`}
      onClick={isLocked ? undefined : () => onOpen(chapter)}
    >
      <div className="chapter-card-accent" />
      <div className="chapter-card-body">
        <div className="chapter-card-top">
          <span className="chapter-year">{isLocked ? chapter.year : chapter.year}</span>
          {isLocked  && <span className="chapter-status chapter-status--locked"><Lock size={9} strokeWidth={2} /> Locked</span>}
          {isRead    && <span className="chapter-status chapter-status--read">◆ Read</span>}
          {isUnread  && <span className="chapter-status chapter-status--unread">● New</span>}
        </div>
        <p className="chapter-title">{chapter.title}</p>
      </div>
      {!isLocked && <ChevronRight size={14} className="chapter-chevron" />}
    </div>
  )
}

// ─── Detail reading view ──────────────────────────────────────
function ChapterDetail({ chapter, onBack }) {
  const paragraphs = chapter.lore.split('\n\n')
  return (
    <div className="chapter-detail">
      <div className="chapter-detail-header">
        <button className="chapter-back" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <span className="chapter-detail-year">{chapter.year}</span>
      </div>

      <div className="chapter-detail-content">
        <div className="chapter-detail-title-block">
          <div className="sect-divider" style={{ padding: '0 0 16px' }}>
            <div className="sect-divider-line" />
            <span className="sect-divider-diamond">◆</span>
            <span className="sect-divider-label">Chapter {chapter.id}</span>
            <span className="sect-divider-diamond">◆</span>
            <div className="sect-divider-line" />
          </div>
          <h1 className="chapter-detail-title">{chapter.title}</h1>
        </div>

        <div className="chapter-detail-body">
          {paragraphs.map((para, i) => (
            <p key={i} className="chapter-para">{para}</p>
          ))}
        </div>

        <div className="chapter-detail-end">
          <div className="sect-divider">
            <div className="sect-divider-line" />
            <span className="sect-divider-diamond">◆</span>
            <span className="sect-divider-label">End of Chapter</span>
            <span className="sect-divider-diamond">◆</span>
            <div className="sect-divider-line" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────
export default function LoreScreen() {
  const [readIds,  setReadIds]  = useState(
    new Set(CHAPTERS.filter(c => c.initialState === 'read').map(c => c.id))
  )
  const [selected, setSelected] = useState(null)

  function openChapter(chapter) {
    setReadIds(prev => new Set([...prev, chapter.id]))
    setSelected(chapter)
  }

  if (selected) {
    return <ChapterDetail chapter={selected} onBack={() => setSelected(null)} />
  }

  const readCount   = CHAPTERS.filter(c => readIds.has(c.id)).length
  const unlockPct   = (UNLOCKED / TOTAL) * 100

  return (
    <div className="lore-screen">

      <header className="lore-header">
        <div className="lore-header-row">
          <div className="home-title">
            <span className="home-title-diamond">⬥</span>
            <span className="home-title-text">CHRONICLES</span>
          </div>
          <span className="lore-unlock-label">{readCount} / {TOTAL} read</span>
        </div>
        <div className="lore-progress-wrap">
          <div className="pbar-track lore-pbar">
            <div
              className="pbar-fill"
              style={{ width: `${unlockPct}%`, background: 'var(--gold)', boxShadow: '0 0 6px var(--gold-dark)' }}
            />
          </div>
          <span className="lore-progress-label">{UNLOCKED} / {TOTAL} chapters unlocked</span>
        </div>
      </header>

      <div className="lore-content">
        <div className="lore-city-header">
          <div className="lore-city-name">London</div>
          <div className="lore-city-sub">History of a City</div>
        </div>

        <div className="chapter-list">
          {CHAPTERS.map(ch => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              readIds={readIds}
              onOpen={openChapter}
            />
          ))}
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}

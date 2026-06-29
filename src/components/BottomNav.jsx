import { Compass, Swords, Map, BookOpen, User, Trophy } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',    Icon: Compass  },
  { id: 'quests',  label: 'Quests',  Icon: Swords   },
  { id: 'map',     label: 'Map',     Icon: Map      },
  { id: 'lore',    label: 'Lore',    Icon: BookOpen },
  { id: 'quiz',    label: 'Quiz',    Icon: Trophy   },
  { id: 'profile', label: 'Profile', Icon: User     },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-btn${active === id ? ' active' : ''}`}
          onClick={() => onChange(id)}
          aria-label={label}
        >
          <Icon className="nav-icon" strokeWidth={1.75} />
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}

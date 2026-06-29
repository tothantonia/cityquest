import { useState, useEffect, useRef, useCallback } from 'react'
import { INITIAL_QUESTS, PLAYER, NPCS, xpToLevel } from './data/gameData'
import BottomNav from './components/BottomNav'
import NpcScene from './components/NpcScene'
import HomeScreen from './screens/HomeScreen'
import QuestsScreen from './screens/QuestsScreen'
import MapScreen from './screens/MapScreen'
import LoreScreen from './screens/LoreScreen'
import ProfileScreen from './screens/ProfileScreen'
import QuizScreen from './screens/QuizScreen'
import QuizTabScreen from './screens/QuizTabScreen'
import './index.css'

const CENTER = [51.5130, -0.1000]

function haversineKm(lat1, lng1, lat2, lng2) {
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a    = Math.sin(dLat / 2) ** 2 +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Discovery banner (slides in from top) ────────────────────
function DiscoveryBanner({ quest, npc, onDismiss }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [])

  const NpcIcon  = npc?.Icon
  const npcColor = npc?.color || '#c9a84c'

  return (
    <div className={`discovery-banner${visible ? ' discovery-banner--in' : ''}`}>
      <div className="discovery-banner-inner">
        <div className="discovery-banner-header">
          <span className="discovery-banner-tag">◆ New Quest Discovered ◆</span>
          <button className="discovery-banner-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
        </div>
        {npc && (
          <div className="discovery-banner-npc">
            <div
              className="discovery-banner-npc-icon"
              style={{ color: npcColor, borderColor: `${npcColor}44` }}
            >
              {NpcIcon && <NpcIcon size={18} strokeWidth={1.5} />}
            </div>
            <div>
              <span className="discovery-banner-npc-name" style={{ color: npcColor }}>{npc.name}</span>
              <span className="discovery-banner-npc-era">{npc.era}</span>
            </div>
          </div>
        )}
        <p className="discovery-banner-quest-title">{quest.title}</p>
        <p className="discovery-banner-quote">"{quest.npcQuote}"</p>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const [active,            setActive]            = useState('home')
  const [quests,            setQuests]            = useState(INITIAL_QUESTS)
  const [metNpcs,           setMetNpcs]           = useState(new Set())
  const [npcScene,          setNpcScene]          = useState(null)
  const [playerXp,          setPlayerXp]          = useState(() => {
    if (localStorage.getItem('cq_version') !== '2') return 0
    return Math.max(0, parseInt(localStorage.getItem('cq_xp') || '0') || 0)
  })
  const [quizHistory,       setQuizHistory]       = useState([])
  const [todayQuizDone,     setTodayQuizDone]     = useState(false)
  const [devQuizUnlocked,   setDevQuizUnlocked]   = useState(false)
  const [playerPos,         setPlayerPos]         = useState(CENTER)
  const [locationPermission, setLocationPermission] = useState('unknown')
  const [discoveryQueue,    setDiscoveryQueue]    = useState([])

  const questsRef     = useRef(INITIAL_QUESTS)
  const discoveredIds = useRef(new Set())

  useEffect(() => { questsRef.current = quests }, [quests])

  // Clear old saves on first load
  useEffect(() => {
    if (localStorage.getItem('cq_version') !== '2') {
      localStorage.clear()
      localStorage.setItem('cq_version', '2')
      setPlayerXp(0)
    }
  }, [])

  // Persist XP to localStorage
  useEffect(() => {
    localStorage.setItem('cq_xp', String(playerXp))
  }, [playerXp])

  // GPS watch (position + permission)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission('denied')
      return
    }
    const id = navigator.geolocation.watchPosition(
      pos => {
        setLocationPermission('granted')
        setPlayerPos([pos.coords.latitude, pos.coords.longitude])
      },
      err => {
        if (err.code === 1) setLocationPermission('denied')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  // Discover gps-method quests within 200 m of a position
  const checkNearby = useCallback((pos) => {
    const [lat, lng] = pos
    const toDiscover = questsRef.current.filter(q =>
      q.status === 'locked' &&
      q.coords &&
      q.discoveryMethod === 'gps' &&
      !discoveredIds.current.has(q.id) &&
      haversineKm(lat, lng, q.coords.lat, q.coords.lng) <= 0.2
    )
    if (!toDiscover.length) return
    toDiscover.forEach(q => discoveredIds.current.add(q.id))
    const ids = new Set(toDiscover.map(q => q.id))
    setQuests(prev => prev.map(q => ids.has(q.id) ? { ...q, status: 'discovered' } : q))
    setDiscoveryQueue(prev => [...prev, ...toDiscover])
  }, [])

  // Run discovery check on every GPS update
  useEffect(() => {
    if (locationPermission !== 'granted') return
    checkNearby(playerPos)
  }, [playerPos, locationPermission, checkNearby])

  // Auto-dismiss discovery banner after 5 s
  useEffect(() => {
    if (!discoveryQueue.length) return
    const t = setTimeout(() => setDiscoveryQueue(prev => prev.slice(1)), 5000)
    return () => clearTimeout(t)
  }, [discoveryQueue[0]?.id])

  function discoverAllGpsQuests() {
    const toDiscover = questsRef.current.filter(q =>
      q.status === 'locked' &&
      q.discoveryMethod === 'gps' &&
      !discoveredIds.current.has(q.id)
    )
    if (!toDiscover.length) return
    toDiscover.forEach(q => discoveredIds.current.add(q.id))
    const ids = new Set(toDiscover.map(q => q.id))
    setQuests(prev => prev.map(q => ids.has(q.id) ? { ...q, status: 'discovered' } : q))
    setDiscoveryQueue(prev => [...prev, ...toDiscover])
  }

  function toggleTask(questId, taskId) {
    setQuests(prev =>
      prev.map(q =>
        q.id !== questId ? q : {
          ...q,
          tasks: q.tasks.map(t =>
            t.id !== taskId ? t : { ...t, done: !t.done }
          ),
        }
      )
    )
  }

  function handleNpcTap(npc) {
    if (!npc.intro)           return
    if (metNpcs.has(npc.id)) return
    setNpcScene(npc)
  }

  function handleNpcSceneComplete() {
    setMetNpcs(prev => new Set([...prev, npcScene.id]))
    setNpcScene(null)
    setActive('quests')
  }

  function handleQuizComplete(score, xp) {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    setQuizHistory(prev => [{ date, score, total: 10, xp }, ...prev])
    setTodayQuizDone(true)
    setPlayerXp(prev => prev + xp)
  }

  const screenProps = {
    quests,
    toggleTask,
    onNavigate:          setActive,
    onNpcTap:            handleNpcTap,
    playerXp,
    quizHistory,
    todayQuizDone,
    onQuizComplete:      handleQuizComplete,
    devQuizUnlocked,
    onDevUnlockQuiz:    () => setDevQuizUnlocked(true),
    onDevResetAll:      () => {
      setPlayerXp(0)
      setQuests(INITIAL_QUESTS)
      setTodayQuizDone(false)
      setDevQuizUnlocked(false)
      setQuizHistory([])
      discoveredIds.current = new Set()
    },
    onDevDiscoverAll:   discoverAllGpsQuests,
    onDevAdd100Xp:      () => setPlayerXp(prev => prev + 100),
    playerPos,
    locationPermission,
    onDiscoverNearby:    checkNearby,
  }

  const SCREENS = {
    home:     HomeScreen,
    quests:   QuestsScreen,
    map:      MapScreen,
    lore:     LoreScreen,
    profile:  ProfileScreen,
    quiz:     QuizTabScreen,
    quizplay: QuizScreen,
  }

  const Screen    = SCREENS[active]
  const navActive = active === 'quizplay' ? 'quiz' : active

  const currentDiscovery = discoveryQueue[0] ?? null
  const discoveryNpc     = currentDiscovery
    ? NPCS.find(n => n.id === currentDiscovery.npcId) ?? null
    : null

  return (
    <div className="app">
      <div className="screen-wrap">
        <Screen {...screenProps} />
      </div>
      <BottomNav active={navActive} onChange={setActive} />
      {npcScene && (
        <NpcScene npc={npcScene} onComplete={handleNpcSceneComplete} />
      )}
      {currentDiscovery && (
        <DiscoveryBanner
          quest={currentDiscovery}
          npc={discoveryNpc}
          onDismiss={() => setDiscoveryQueue(prev => prev.slice(1))}
        />
      )}
    </div>
  )
}

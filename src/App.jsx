import { useState } from 'react'
import { INITIAL_QUESTS, PLAYER } from './data/gameData'
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

export default function App() {
  const [active,        setActive]        = useState('home')
  const [quests,        setQuests]        = useState(INITIAL_QUESTS)
  const [metNpcs,       setMetNpcs]       = useState(new Set())
  const [npcScene,      setNpcScene]      = useState(null)
  const [playerXp,      setPlayerXp]      = useState(PLAYER.xp)
  const [quizHistory,    setQuizHistory]    = useState([])
  const [todayQuizDone,  setTodayQuizDone]  = useState(false)
  const [devQuizUnlocked, setDevQuizUnlocked] = useState(false)

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
    onNavigate:       setActive,
    onNpcTap:         handleNpcTap,
    playerXp,
    quizHistory,
    todayQuizDone,
    onQuizComplete:   handleQuizComplete,
    devQuizUnlocked,
    onDevUnlockQuiz:  () => setDevQuizUnlocked(true),
    onDevResetQuiz:   () => { setTodayQuizDone(false); setDevQuizUnlocked(false) },
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

  return (
    <div className="app">
      <div className="screen-wrap">
        <Screen {...screenProps} />
      </div>
      <BottomNav active={navActive} onChange={setActive} />
      {npcScene && (
        <NpcScene npc={npcScene} onComplete={handleNpcSceneComplete} />
      )}
    </div>
  )
}

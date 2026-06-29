import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, ChevronRight, Lock } from 'lucide-react'
import { CAT } from '../data/gameData'

// ─── Constants ────────────────────────────────────────────────
const CENTER   = [51.5130, -0.1000]
const ZOOM     = 13
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'

const CAT_COLORS = {
  Exploration: '#4a7fc9',
  Food:        '#c97a4c',
  Mystery:     '#9a5cc9',
  History:     '#c9a84c',
  HiddenGem:   '#5cb87a',
  Social:      '#e87c5a',
  Music:       '#7a4cc9',
  Art:         '#4cc9a8',
}

const MARKER_LETTERS = {
  Exploration: 'E',
  Food:        'F',
  Mystery:     'M',
  History:     'H',
  HiddenGem:   '◆',
  Social:      'S',
  Music:       '♩',
  Art:         'A',
}

// ─── Non-quest lore markers (static) ─────────────────────────
const LORE_MARKERS = [
  {
    id: 'london-bridge',
    name: 'London Bridge',
    category: 'History',
    type: 'lore',
    loreText: 'Over 2,000 years of crossings, sieges, and medieval executions. The bridge that held London together — and apart.',
    lat: 51.5079, lng: -0.0878,
  },
]

// ─── Build markers from quest roster ─────────────────────────
function buildQuestMarkers(quests) {
  return quests
    .filter(q => q.coords !== null)
    .map(q => ({
      id: `quest-${q.id}`,
      name: q.status === 'discovered' ? q.title : '???',
      category: q.category,
      type: q.status === 'discovered' ? 'active-quest' : 'undiscovered',
      questId: q.id,
      questName: q.title,
      xp: q.xp,
      lat: q.coords.lat,
      lng: q.coords.lng,
    }))
}

// ─── Zoom scaling ─────────────────────────────────────────────
function getScale(zoom) {
  return Math.min(Math.max(Math.pow(1.3, zoom - 13), 0.35), 3.0)
}

// ─── Icon factory ─────────────────────────────────────────────
function buildIcon(marker, zoom = 13) {
  const sc = getScale(zoom)

  if (marker.type === 'undiscovered') {
    const s  = Math.max(8, Math.round(20 * sc))
    const fs = Math.max(7, Math.round(10 * sc))
    const bw = Math.max(1, Math.round(1.5 * sc))
    return L.divIcon({
      html: `<div style="width:${s}px;height:${s}px;border-radius:50%;background:rgba(40,40,40,0.85);border:${bw}px solid rgba(120,120,120,0.4);display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:700;color:rgba(160,160,160,0.7);line-height:1;cursor:pointer;">?</div>`,
      className: '', iconSize: [s, s], iconAnchor: [s / 2, s / 2],
    })
  }

  const color  = CAT_COLORS[marker.category] || '#c9a84c'
  const letter = MARKER_LETTERS[marker.category] || marker.category[0]

  if (marker.type === 'lore') {
    const s  = Math.max(8, Math.round(22 * sc))
    const fs = Math.max(7, Math.round(11 * sc))
    const bw = Math.max(1, Math.round(1.5 * sc))
    const gl = Math.round(6 * sc)
    return L.divIcon({
      html: `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${color}99;border:${bw}px solid ${color}cc;display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:700;color:#fff;line-height:1;box-shadow:0 0 ${gl}px ${color}55,0 2px 5px rgba(0,0,0,0.5);">${letter}</div>`,
      className: '', iconSize: [s, s], iconAnchor: [s / 2, s / 2],
    })
  }

  // active-quest
  const s  = Math.max(10, Math.round(28 * sc))
  const fs = Math.max(9, Math.round(13 * sc))
  const bw = Math.max(2, Math.round(2.5 * sc))
  const gl = Math.round(14 * sc)
  return L.divIcon({
    html: `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${color};border:${bw}px solid rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:700;color:#fff;line-height:1;box-shadow:0 0 ${gl}px ${color}aa,0 0 ${Math.round(5 * sc)}px ${color},0 3px 10px rgba(0,0,0,0.5);">${letter}</div>`,
    className: '', iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  })
}

function buildPlayerIcon(zoom = 13) {
  const sc = getScale(zoom)
  const s  = Math.round(16 * sc)
  const bw = Math.max(1.5, Math.round(2 * sc))
  return L.divIcon({
    html: `<div style="width:${s}px;height:${s}px;background:#c9a84c;border-radius:50%;border:${bw}px solid rgba(255,255,255,0.9);box-shadow:0 0 0 0 rgba(201,168,76,0.7);animation:player-ping 1.8s ease-out infinite;"></div>`,
    className: '', iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  })
}

// ─── Map helpers (must live inside MapContainer) ──────────────
function ZoomTracker({ onZoom }) {
  useMapEvents({ zoomend: e => onZoom(e.target.getZoom()) })
  return null
}

function FlyController({ target, onDone }) {
  const map = useMap()
  useEffect(() => {
    if (!target) return
    map.flyTo(target.pos, target.zoom, { duration: 0.7 })
    onDone()
  }, [target])
  return null
}

function MapCentreTracker({ onCentre }) {
  useMapEvents({ moveend: e => { const c = e.target.getCenter(); onCentre([c.lat, c.lng]) } })
  return null
}

// ─── Haversine helpers ────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a    = Math.sin(dLat / 2) ** 2 +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function fmtDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

// ─── Single marker ────────────────────────────────────────────
function QMarker({ marker, zoom, onSelect }) {
  const icon = useMemo(() => buildIcon(marker, zoom), [marker.id, marker.type, zoom])
  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(marker) }}
    />
  )
}

function PlayerMarker({ pos, zoom }) {
  const icon = useMemo(() => buildPlayerIcon(zoom), [zoom])
  return <Marker position={pos} icon={icon} />
}

// ─── Tap info card ────────────────────────────────────────────
function InfoCard({ marker, quests, playerPos, onClose, onNavigate }) {
  const catDef = CAT[marker.category]
  const color  = CAT_COLORS[marker.category] || '#c9a84c'
  const quest  = quests?.find(q => q.id === marker.questId)
  const done   = quest ? quest.tasks.filter(t => t.done).length : 0
  const total  = quest ? quest.tasks.length : 0
  const dist   = fmtDist(haversineKm(playerPos[0], playerPos[1], marker.lat, marker.lng))

  return (
    <div className="map-info-card">
      <button className="map-info-close" onClick={onClose} aria-label="Close">✕</button>

      {marker.type === 'undiscovered' && <>
        <div className="map-info-header">
          <span className="cat-badge" style={{ color: 'var(--text-4)', borderColor: 'var(--text-4)', background: 'transparent' }}>
            ??? Undiscovered
          </span>
        </div>
        <h3 className="map-info-title">???</h3>
        <p className="map-info-lore">Explore this area to unlock.</p>
      </>}

      {marker.type === 'lore' && <>
        <div className="map-info-header">
          <span className="cat-badge" style={{ color, borderColor: `${color}44`, background: `${color}14` }}>
            History
          </span>
          <span className="map-info-lore-badge">◆ Lore</span>
        </div>
        <h3 className="map-info-title">{marker.name}</h3>
        <p className="map-info-lore">{marker.loreText}</p>
      </>}

      {marker.type === 'active-quest' && <>
        <div className="map-info-header">
          <span className="cat-badge" style={{ color, borderColor: `${color}44`, background: `${color}14` }}>
            {catDef && <catDef.Icon size={9} strokeWidth={2} />}
            {catDef ? catDef.label : marker.category}
          </span>
          <span className="xp-chip">⭑ {marker.xp} XP</span>
        </div>
        <h3 className="map-info-title">{marker.questName}</h3>
        <div className="map-info-row">
          <span className="map-info-meta"><MapPin size={10} /> {dist}</span>
          {quest && <span className="map-info-meta">{done} / {total} tasks</span>}
        </div>
        <button
          className="map-info-btn"
          style={{ borderColor: `${color}66`, color }}
          onClick={() => { onNavigate('quests'); onClose() }}
        >
          View Quest <ChevronRight size={12} />
        </button>
      </>}
    </div>
  )
}

// ─── Location list ────────────────────────────────────────────
function LocationList({ markers, playerPos, onSelect }) {
  const sorted = [...markers].sort((a, b) =>
    haversineKm(playerPos[0], playerPos[1], a.lat, a.lng) -
    haversineKm(playerPos[0], playerPos[1], b.lat, b.lng)
  )

  const visibleCount = markers.filter(m => m.type !== 'hidden').length

  return (
    <div className="map-list">
      <div className="map-list-header">
        <span className="map-list-title">Nearby Locations</span>
        <span className="map-list-count">{visibleCount} locations</span>
      </div>
      {sorted.map(m => {
        const color         = CAT_COLORS[m.category] || '#4a3a28'
        const catDef        = CAT[m.category]
        const isUndiscovered = m.type === 'undiscovered'
        const isLore        = m.type === 'lore'
        const km            = haversineKm(playerPos[0], playerPos[1], m.lat, m.lng)

        return (
          <div
            key={m.id}
            className="map-list-item"
            onClick={() => onSelect(m)}
          >
            <div
              className="map-list-accent"
              style={{ background: isUndiscovered ? 'rgba(120,120,120,0.3)' : color }}
            />
            <div className="map-list-body">
              <span className="map-list-name">{m.name}</span>
              <div className="map-list-meta">
                {isUndiscovered ? (
                  <span className="cat-badge" style={{ color: 'var(--text-4)', borderColor: 'var(--text-4)', background: 'transparent' }}>
                    ??? Undiscovered
                  </span>
                ) : isLore ? (
                  <span className="cat-badge" style={{ color, borderColor: `${color}44`, background: `${color}14` }}>
                    ◆ Lore
                  </span>
                ) : (
                  <span className="cat-badge" style={{ color, borderColor: `${color}44`, background: `${color}14` }}>
                    {catDef && <catDef.Icon size={8} strokeWidth={2} />}
                    {catDef ? catDef.label : m.category}
                  </span>
                )}
                <span className="map-list-dist">
                  <MapPin size={9} strokeWidth={2} />
                  {fmtDist(km)}
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="map-list-chevron" />
          </div>
        )
      })}
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────
export default function MapScreen({ quests, onNavigate, playerPos, locationPermission, onDiscoverNearby, defaultCenter }) {
  const MAP_CENTER = defaultCenter || CENTER
  const [selected,   setSelected]   = useState(null)
  const [zoom,       setZoom]       = useState(ZOOM)
  const [flyTarget,  setFlyTarget]  = useState(null)
  const [mapCentre,  setMapCentre]  = useState(MAP_CENTER)

  const questMarkers = useMemo(() => buildQuestMarkers(quests), [quests])
  const allMarkers   = useMemo(() => [...LORE_MARKERS, ...questMarkers], [questMarkers])

  function handleListSelect(marker) {
    setSelected(marker)
    setFlyTarget({ pos: [marker.lat, marker.lng], zoom: Math.max(zoom, 15) })
  }

  return (
    <div className="map-screen">

      <div className="map-map-wrap">
        <MapContainer
          center={MAP_CENTER}
          zoom={ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={19} />
          <ZoomTracker onZoom={setZoom} />
          <FlyController target={flyTarget} onDone={() => setFlyTarget(null)} />
          <MapCentreTracker onCentre={setMapCentre} />

          {allMarkers.map(m => (
            <QMarker key={m.id} marker={m} zoom={zoom} onSelect={setSelected} />
          ))}

          <PlayerMarker pos={playerPos} zoom={zoom} />
        </MapContainer>

        {locationPermission === 'denied' && (
          <button
            className="map-here-btn"
            onClick={() => onDiscoverNearby(mapCentre)}
          >
            <MapPin size={13} strokeWidth={2} />
            I Am Here
          </button>
        )}

        {selected && (
          <InfoCard
            marker={selected}
            quests={quests}
            playerPos={playerPos}
            onClose={() => setSelected(null)}
            onNavigate={onNavigate}
          />
        )}
      </div>

      <LocationList
        markers={allMarkers}
        playerPos={playerPos}
        onSelect={handleListSelect}
      />

    </div>
  )
}

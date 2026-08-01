import { useEffect, useMemo, useRef, useState } from 'react'
import { resolvePlaceCoordinates } from '../data/place-coordinates'
import type { LifeEvent, Person, Relationship } from '../types/genealogy'

type EventType = 'birth' | 'marriage' | 'death'

interface MapEvent {
  id: string
  type: EventType
  person: Person
  date?: string
  placeName: string
  latitude: number
  longitude: number
}

interface LeafletMap {
  remove: () => void
  setView: (center: [number, number], zoom: number) => LeafletMap
  invalidateSize: (options?: Record<string, unknown>) => LeafletMap
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker
  bindTooltip: (content: string, options?: Record<string, unknown>) => LeafletMarker
  on: (events: Record<string, () => void>) => LeafletMarker
}

interface LeafletApi {
  map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap
  tileLayer: (url: string, options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }
  marker: (position: [number, number], options?: Record<string, unknown>) => LeafletMarker
  divIcon: (options: Record<string, unknown>) => unknown
  control: { zoom: (options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => void } }
}

declare global {
  interface Window {
    L?: LeafletApi
  }
}

const eventLabels: Record<EventType, string> = {
  birth: 'Naissance',
  marriage: 'Mariage',
  death: 'Décès',
}

function addEvent(
  events: MapEvent[],
  type: EventType,
  person: Person,
  event: LifeEvent | undefined | null,
  idSuffix = '',
) {
  const coordinates = resolvePlaceCoordinates(event?.place)
  if (!event?.place || !coordinates) return

  events.push({
    id: `${person.id}-${type}${idSuffix}`,
    type,
    person,
    date: event.date?.value,
    placeName: event.place.name,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  })
}

function buildMapEvents(people: Person[], relationships: Relationship[]) {
  const events: MapEvent[] = []
  const peopleById = new Map(people.map(person => [person.id, person]))

  people.forEach(person => {
    addEvent(events, 'birth', person, person.birth)
    addEvent(events, 'death', person, person.death)
  })

  relationships
    .filter(relationship => relationship.type === 'marriage')
    .forEach(relationship => {
      relationship.personIds.forEach((personId, index) => {
        const person = peopleById.get(personId)
        if (person) addEvent(events, 'marriage', person, relationship.start, `-${relationship.id}-${index}`)
      })
    })

  const locationCounts = new Map<string, number>()
  return events.map(event => {
    const key = `${event.latitude.toFixed(4)}:${event.longitude.toFixed(4)}:${event.type}`
    const index = locationCounts.get(key) ?? 0
    locationCounts.set(key, index + 1)
    const angle = index * 2.399963
    const radius = Math.min(index, 8) * 0.0018
    return {
      ...event,
      latitude: event.latitude + Math.sin(angle) * radius,
      longitude: event.longitude + Math.cos(angle) * radius,
    }
  })
}

function waitForLeafletCss() {
  const link = document.getElementById('leaflet-css') as HTMLLinkElement | null
  if (!link) return Promise.resolve()
  if (link.sheet) return Promise.resolve()

  return new Promise<void>(resolve => {
    const finish = () => resolve()
    link.addEventListener('load', finish, { once: true })
    link.addEventListener('error', finish, { once: true })
    window.setTimeout(finish, 2500)
  })
}

async function loadLeaflet() {
  await waitForLeafletCss()
  if (window.L) return window.L

  return new Promise<LeafletApi>((resolve, reject) => {
    const existing = document.getElementById('leaflet-js') as HTMLScriptElement | null
    if (existing) {
      if (window.L) {
        resolve(window.L)
        return
      }
      existing.addEventListener('load', () => window.L ? resolve(window.L) : reject(new Error('Leaflet indisponible')))
      existing.addEventListener('error', () => reject(new Error('Impossible de charger Leaflet')))
      return
    }

    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = 'anonymous'
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet indisponible'))
    script.onerror = () => reject(new Error('Impossible de charger Leaflet'))
    document.head.appendChild(script)
  })
}

interface Props {
  people: Person[]
  relationships: Relationship[]
  onOpenPerson: (personId: string) => void
}

export function GenealogyMap({ people, relationships, onOpenPerson }: Props) {
  const mapElement = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<LeafletMap | null>(null)
  const events = useMemo(() => buildMapEvents(people, relationships), [people, relationships])
  const [selected, setSelected] = useState<MapEvent | null>(null)
  const [loadError, setLoadError] = useState('')
  const [enabledTypes, setEnabledTypes] = useState<Record<EventType, boolean>>({
    birth: true,
    marriage: true,
    death: true,
  })

  const visibleEvents = useMemo(
    () => events.filter(event => enabledTypes[event.type]),
    [events, enabledTypes],
  )

  useEffect(() => {
    let cancelled = false
    let resizeObserver: ResizeObserver | null = null
    let resizeTimer = 0

    loadLeaflet()
      .then(L => {
        if (cancelled || !mapElement.current) return
        mapInstance.current?.remove()

        const map = L.map(mapElement.current, {
          center: [46.65, -72.35],
          zoom: 6,
          zoomControl: false,
          minZoom: 2,
          maxZoom: 18,
          scrollWheelZoom: true,
          touchZoom: true,
          bounceAtZoomLimits: false,
          tap: true,
        })
        mapInstance.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)
        L.control.zoom({ position: 'topright' }).addTo(map)

        visibleEvents.forEach(event => {
          const icon = L.divIcon({
            className: 'genealogy-marker-wrap',
            html: `<span class="genealogy-marker genealogy-marker--${event.type}" aria-hidden="true"></span>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          })
          const marker = L.marker([event.latitude, event.longitude], {
            icon,
            keyboard: true,
            title: event.person.names.display,
          })
          marker
            .addTo(map)
            .bindTooltip(`${event.person.names.display} · ${eventLabels[event.type]}`, {
              direction: 'top',
              offset: [0, -10],
              opacity: 0.96,
            })
            .on({
              click: () => setSelected(event),
              mouseover: () => {
                if (window.matchMedia('(hover: hover)').matches) setSelected(event)
              },
            })
        })

        const refreshSize = () => {
          window.clearTimeout(resizeTimer)
          resizeTimer = window.setTimeout(() => map.invalidateSize({ pan: false }), 60)
        }

        requestAnimationFrame(() => {
          map.invalidateSize({ pan: false })
          window.setTimeout(() => map.invalidateSize({ pan: false }), 250)
        })

        if ('ResizeObserver' in window) {
          resizeObserver = new ResizeObserver(refreshSize)
          resizeObserver.observe(mapElement.current)
        }
        window.addEventListener('orientationchange', refreshSize)
        window.addEventListener('resize', refreshSize)
      })
      .catch(error => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'La carte ne peut pas être chargée.')
      })

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      window.clearTimeout(resizeTimer)
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [visibleEvents])

  function toggleType(type: EventType) {
    setEnabledTypes(current => ({ ...current, [type]: !current[type] }))
  }

  return (
    <section className="map-view" aria-label="Carte généalogique">
      <div className="map-toolbar">
        <div>
          <h2>Carte des événements familiaux</h2>
          <p>{visibleEvents.length} événements géolocalisés sur {events.length}</p>
        </div>
        <div className="map-filters" aria-label="Types d’événements affichés">
          {(Object.keys(eventLabels) as EventType[]).map(type => (
            <button
              key={type}
              className={`map-filter map-filter--${type} ${enabledTypes[type] ? 'is-active' : ''}`}
              onClick={() => toggleType(type)}
              aria-pressed={enabledTypes[type]}
            >
              <span aria-hidden="true" />{eventLabels[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="map-stage">
        <div ref={mapElement} className="genealogy-map" />
        {loadError && <div className="map-error">{loadError}</div>}
        <div className="map-legend" aria-label="Légende">
          {(Object.keys(eventLabels) as EventType[]).map(type => (
            <span key={type}><i className={`legend-dot legend-dot--${type}`} />{eventLabels[type]}</span>
          ))}
        </div>

        {selected && (
          <article className="map-person-card" aria-live="polite">
            <button className="map-person-card__close" onClick={() => setSelected(null)} aria-label="Fermer">×</button>
            <p className={`map-person-card__event map-person-card__event--${selected.type}`}>{eventLabels[selected.type]}</p>
            <h3>{selected.person.names.display}</h3>
            <p className="map-person-card__meta">{selected.date ?? 'Date inconnue'} · {selected.placeName}</p>
            {selected.person.biography?.summary && <p>{selected.person.biography.summary}</p>}
            <button className="map-person-card__open" onClick={() => onOpenPerson(selected.person.id)}>Voir dans l’arbre</button>
          </article>
        )}
      </div>
      <p className="map-note">Les points représentent le centre approximatif d’une municipalité ou d’une paroisse historique, et non une adresse précise.</p>
    </section>
  )
}

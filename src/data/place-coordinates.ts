import type { Place } from '../types/genealogy'

export interface MapCoordinates {
  latitude: number
  longitude: number
}

interface KnownPlace {
  aliases: string[]
  coordinates: MapCoordinates
}

function normalizePlaceName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// These coordinates identify the municipality or historical parish, not a
// precise house, church or cemetery plot. More specific entries must remain
// before broader regional entries such as Québec or France.
const knownPlaces: KnownPlace[] = [
  { aliases: ['maison michel sarrazin'], coordinates: { latitude: 46.769, longitude: -71.292 } },
  { aliases: ['maison beauport'], coordinates: { latitude: 46.858, longitude: -71.19 } },
  { aliases: ['hopital saint sacrement'], coordinates: { latitude: 46.792, longitude: -71.264 } },
  { aliases: ['sainte catherine de la jacques cartier'], coordinates: { latitude: 46.853, longitude: -71.62 } },
  { aliases: ['saint michel archange'], coordinates: { latitude: 46.856, longitude: -71.207 } },
  { aliases: ['saint jean ile d orleans', 'saint jean baptiste ile d orleans'], coordinates: { latitude: 46.918, longitude: -70.899 } },
  { aliases: ['saint pierre ile d orleans'], coordinates: { latitude: 46.885, longitude: -71.073 } },
  { aliases: ['sainte famille ile d orleans'], coordinates: { latitude: 47.001, longitude: -70.816 } },
  { aliases: ['saint laurent ile d orleans'], coordinates: { latitude: 46.873, longitude: -71.012 } },
  { aliases: ['ile d orleans'], coordinates: { latitude: 46.949, longitude: -70.958 } },
  { aliases: ['saint louis ile aux coudres', 'ile aux coudres'], coordinates: { latitude: 47.404, longitude: -70.387 } },
  { aliases: ['notre dame de l assomption les eboulements', 'les eboulements'], coordinates: { latitude: 47.481, longitude: -70.323 } },
  { aliases: ['saint etienne la malbaie', 'la malbaie'], coordinates: { latitude: 47.655, longitude: -70.153 } },
  { aliases: ['baie saint paul'], coordinates: { latitude: 47.441, longitude: -70.504 } },
  { aliases: ['saint hilarion'], coordinates: { latitude: 47.573, longitude: -70.41 } },
  { aliases: ['saint cyrille normandin', 'normandin'], coordinates: { latitude: 48.836, longitude: -72.532 } },
  { aliases: ['saint stanislas'], coordinates: { latitude: 48.984, longitude: -72.17 } },
  { aliases: ['grande riviere'], coordinates: { latitude: 48.397, longitude: -64.5 } },
  { aliases: ['saint michel de perce', 'perce'], coordinates: { latitude: 48.524, longitude: -64.213 } },
  { aliases: ['bonaventure'], coordinates: { latitude: 48.047, longitude: -65.491 } },
  { aliases: ['new carlisle'], coordinates: { latitude: 48.009, longitude: -65.333 } },
  { aliases: ['port daniel'], coordinates: { latitude: 48.183, longitude: -64.968 } },
  { aliases: ['tadoussac'], coordinates: { latitude: 48.143, longitude: -69.716 } },
  { aliases: ['saint ulric'], coordinates: { latitude: 48.782, longitude: -67.697 } },
  { aliases: ['grand mere'], coordinates: { latitude: 46.616, longitude: -72.696 } },
  { aliases: ['la prairie'], coordinates: { latitude: 45.417, longitude: -73.499 } },
  { aliases: ['quebec quebec', 'quebec nouvelle france', 'quebec'], coordinates: { latitude: 46.814, longitude: -71.208 } },
  { aliases: ['gatineau'], coordinates: { latitude: 45.477, longitude: -75.701 } },
  { aliases: ['ottawa'], coordinates: { latitude: 45.421, longitude: -75.697 } },
  { aliases: ['etusson'], coordinates: { latitude: 46.957, longitude: -0.514 } },
  { aliases: ['dieppe'], coordinates: { latitude: 49.922, longitude: 1.078 } },
  { aliases: ['jersey'], coordinates: { latitude: 49.214, longitude: -2.132 } },
  { aliases: ['irlande'], coordinates: { latitude: 53.3, longitude: -8.0 } },
  { aliases: ['france'], coordinates: { latitude: 46.603, longitude: 1.888 } },
]

export function resolvePlaceCoordinates(place?: Place): MapCoordinates | null {
  if (!place) return null
  if (place.coordinates) return place.coordinates

  const normalized = normalizePlaceName(place.name)
  const match = knownPlaces.find(entry =>
    entry.aliases.some(alias => normalized.includes(normalizePlaceName(alias))),
  )

  return match?.coordinates ?? null
}

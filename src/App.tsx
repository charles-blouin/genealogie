import { useMemo, useState } from 'react'
import peopleData from './data/people.json'
import livingNamesData from './data/living-names.json'
import relationshipData from './data/relationships.json'
import sourceData from './data/sources.json'
import researchData from './data/research.json'
import maternalExtensionData from './data/maternal-extension.json'
import jeanMariePoulinExtensionData from './data/jean-marie-poulin-extension.json'
import paternalExtensionData from './data/paternal-extension.json'
import type { Person, Relationship, ResearchProfile, Source } from './types/genealogy'
import { FamilyTree } from './components/FamilyTree'
import { GenealogyMap } from './components/GenealogyMap'
import './styles.css'

interface GenealogyExtension {
  people?: Person[]
  relationships?: Relationship[]
  sources?: Source[]
  research?: ResearchProfile[]
}

type ViewTab = 'tree' | 'map'

const ROOT_PERSON_ID = 'charles-blouin'

const extensions = [
  maternalExtensionData as GenealogyExtension,
  jeanMariePoulinExtensionData as GenealogyExtension,
  paternalExtensionData as GenealogyExtension,
]

const allResearch = [
  ...(researchData as ResearchProfile[]),
  ...extensions.flatMap(extension => extension.research ?? []),
]
const researchByPerson = new Map<string, ResearchProfile>()

for (const profile of allResearch) {
  const current = researchByPerson.get(profile.personId)
  researchByPerson.set(profile.personId, {
    personId: profile.personId,
    stories: [...(current?.stories ?? []), ...(profile.stories ?? [])],
    researchQuestions: [
      ...(current?.researchQuestions ?? []),
      ...(profile.researchQuestions ?? []),
    ],
  })
}

const allDeceasedPeople = [
  ...(peopleData as Person[]),
  ...extensions.flatMap(extension => extension.people ?? []),
]

const deceasedPeople = allDeceasedPeople.map(person => {
  const research = researchByPerson.get(person.id)
  if (!research) return person

  return {
    ...person,
    biography: {
      ...person.biography,
      stories: [
        ...(person.biography?.stories ?? []),
        ...(research.stories ?? []),
      ],
      researchQuestions: [
        ...(person.biography?.researchQuestions ?? []),
        ...(research.researchQuestions ?? []),
      ],
    },
  }
})

const people = [...(livingNamesData as Person[]), ...deceasedPeople]
const relationships = [
  ...(relationshipData as Relationship[]),
  ...extensions.flatMap(extension => extension.relationships ?? []),
]
const sources = [
  ...(sourceData as Source[]),
  ...extensions.flatMap(extension => extension.sources ?? []),
]

function formatYear(event: Person['birth'] | Person['death']) {
  const date = event?.date
  if (!date?.value) return null

  const year = date.value.match(/\d{4}/)?.[0] ?? date.value
  if (date.qualifier === 'before') return `av. ${year}`
  if (date.qualifier === 'after') return `ap. ${year}`
  if (date.qualifier === 'between' && date.endValue) {
    const endYear = date.endValue.match(/\d{4}/)?.[0] ?? date.endValue
    return `${year}–${endYear}`
  }
  if (date.qualifier === 'about' || date.qualifier === 'estimated' || date.precision === 'decade') {
    return `v. ${year}`
  }
  return year
}

function lifeSpan(person: Person) {
  const birth = formatYear(person.birth)
  const death = formatYear(person.death)

  if (person.living) return birth ? `${birth}–` : 'vivant'
  if (birth && death) return `${birth}–${death}`
  if (birth) return `${birth}–?`
  if (death) return `?–${death}`
  return 'dates inconnues'
}

export default function App() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ViewTab>('tree')
  const [focusPersonId, setFocusPersonId] = useState<string | null>(null)

  const matches = useMemo(
    () =>
      query.trim()
        ? people
            .filter(person =>
              person.names.display.toLowerCase().includes(query.toLowerCase()),
            )
            .sort((a, b) => {
              const nameComparison = a.names.display.localeCompare(b.names.display, 'fr')
              if (nameComparison !== 0) return nameComparison
              return (formatYear(a.birth) ?? '').localeCompare(formatYear(b.birth) ?? '')
            })
        : [],
    [query],
  )

  function openPersonInTree(personId: string) {
    setFocusPersonId(personId)
    setActiveTab('tree')
  }

  return (
    <main>
      <header>
        <div>
          <h1>Arbre généalogique</h1>
          <p>Explorez les ancêtres, leurs histoires et les lieux qui ont marqué leur vie.</p>
        </div>
        <div className="search-wrap">
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Rechercher une personne…"
          />
          {matches.length > 0 && (
            <div className="search-results">
              {matches.map(person => (
                <button
                  key={person.id}
                  onClick={() => {
                    openPersonInTree(person.id)
                    setQuery('')
                  }}
                >
                  <span className="search-result__name">{person.names.display}</span>
                  <span className="search-result__dates">{lifeSpan(person)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <nav className="view-tabs" aria-label="Modes de visualisation">
        <button
          className={activeTab === 'tree' ? 'is-active' : ''}
          onClick={() => setActiveTab('tree')}
          aria-current={activeTab === 'tree' ? 'page' : undefined}
        >
          <span aria-hidden="true">◇</span>
          Arbre
        </button>
        <button
          className={activeTab === 'map' ? 'is-active' : ''}
          onClick={() => setActiveTab('map')}
          aria-current={activeTab === 'map' ? 'page' : undefined}
        >
          <span aria-hidden="true">⌖</span>
          Carte
        </button>
      </nav>

      {activeTab === 'tree' ? (
        <FamilyTree
          people={people}
          relationships={relationships}
          sources={sources}
          rootId={ROOT_PERSON_ID}
          focusPersonId={focusPersonId}
        />
      ) : (
        <GenealogyMap
          people={people}
          relationships={relationships}
          onOpenPerson={openPersonInTree}
        />
      )}
    </main>
  )
}

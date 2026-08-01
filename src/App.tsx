import { useMemo, useState } from 'react'
import peopleData from './data/people.json'
import livingNamesData from './data/living-names.json'
import relationshipData from './data/relationships.json'
import sourceData from './data/sources.json'
import researchData from './data/research.json'
import maternalExtensionData from './data/maternal-extension.json'
import type { Person, Relationship, ResearchProfile, Source } from './types/genealogy'
import { FamilyTree } from './components/FamilyTree'
import './styles.css'

interface GenealogyExtension {
  people?: Person[]
  relationships?: Relationship[]
  sources?: Source[]
  research?: ResearchProfile[]
}

const maternalExtension = maternalExtensionData as GenealogyExtension
const allResearch = [
  ...(researchData as ResearchProfile[]),
  ...(maternalExtension.research ?? []),
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
  ...(maternalExtension.people ?? []),
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
  ...(maternalExtension.relationships ?? []),
]
const sources = [
  ...(sourceData as Source[]),
  ...(maternalExtension.sources ?? []),
]

export default function App() {
  const [rootId, setRootId] = useState('charles-blouin')
  const [query, setQuery] = useState('')

  const matches = useMemo(
    () =>
      query.trim()
        ? people.filter(person =>
            person.names.display.toLowerCase().includes(query.toLowerCase()),
          )
        : [],
    [query],
  )

  return (
    <main>
      <header>
        <div>
          <h1>Arbre généalogique</h1>
          <p>Explorez les ancêtres, leurs histoires et les preuves disponibles.</p>
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
                    setRootId(person.id)
                    setQuery('')
                  }}
                >
                  {person.names.display}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <FamilyTree
        people={people}
        relationships={relationships}
        sources={sources}
        rootId={rootId}
      />
    </main>
  )
}

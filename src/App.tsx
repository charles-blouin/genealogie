import { useMemo, useState } from 'react'
import peopleData from './data/people.json'
import livingNamesData from './data/living-names.json'
import relationshipData from './data/relationships.json'
import sourceData from './data/sources.json'
import researchData from './data/research.json'
import type { Person, Relationship, ResearchProfile, Source } from './types/genealogy'
import { FamilyTree } from './components/FamilyTree'
import './styles.css'

const researchByPerson = new Map((researchData as ResearchProfile[]).map(profile => [profile.personId, profile]))
const deceasedPeople = (peopleData as Person[]).map(person => {
  const research = researchByPerson.get(person.id)
  if (!research) return person
  return {
    ...person,
    biography: {
      ...person.biography,
      stories: [...(person.biography?.stories ?? []), ...(research.stories ?? [])],
      researchQuestions: [...(person.biography?.researchQuestions ?? []), ...(research.researchQuestions ?? [])],
    },
  }
})
const people = [...(livingNamesData as Person[]), ...deceasedPeople]
const relationships = relationshipData as Relationship[]
const sources = sourceData as Source[]

export default function App() {
  const [rootId, setRootId] = useState('charles-blouin')
  const [query, setQuery] = useState('')

  const matches = useMemo(() => query.trim() ? people.filter(p => p.names.display.toLowerCase().includes(query.toLowerCase())) : [], [query])

  return (
    <main>
      <header>
        <div><h1>Arbre généalogique</h1><p>Explorez les ancêtres, leurs histoires et les preuves disponibles.</p></div>
        <div className="search-wrap">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une personne…" />
          {matches.length > 0 && <div className="search-results">{matches.map(p => <button key={p.id} onClick={() => { setRootId(p.id); setQuery('') }}>{p.names.display}</button>)}</div>}
        </div>
      </header>
      <FamilyTree people={people} relationships={relationships} sources={sources} rootId={rootId} />
    </main>
  )
}

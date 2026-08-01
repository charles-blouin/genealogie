import { useMemo, useState } from 'react'
import peopleData from './data/people.json'
import relationshipData from './data/relationships.json'
import type { Person, Relationship } from './types/genealogy'
import { FamilyTree } from './components/FamilyTree'
import { PersonDetails } from './components/PersonDetails'
import './styles.css'

const people = peopleData as Person[]
const relationships = relationshipData as Relationship[]

export default function App() {
  const [selected, setSelected] = useState<Person | null>(null)
  const [rootId, setRootId] = useState('charles-blouin')
  const [query, setQuery] = useState('')

  const matches = useMemo(() => query.trim() ? people.filter(p => p.displayName.toLowerCase().includes(query.toLowerCase())) : [], [query])

  function siblingNames(personId: string) {
    const parentIds = relationships.filter(r => r.type.endsWith('parent') && r.personIds[1] === personId).map(r => r.personIds[0])
    const ids = new Set(relationships.filter(r => r.type.endsWith('parent') && parentIds.includes(r.personIds[0]) && r.personIds[1] !== personId).map(r => r.personIds[1]))
    return [...ids].map(id => people.find(p => p.id === id)?.displayName).filter((name): name is string => Boolean(name))
  }

  return (
    <main>
      <header>
        <div><h1>Family Tree</h1><p>Explore ancestors and open a person for details.</p></div>
        <div className="search-wrap">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a person…" />
          {matches.length > 0 && <div className="search-results">{matches.map(p => <button key={p.id} onClick={() => { setRootId(p.id); setSelected(p); setQuery('') }}>{p.displayName}</button>)}</div>}
        </div>
      </header>
      <FamilyTree people={people} relationships={relationships} rootId={rootId} onSelect={setSelected} />
      <PersonDetails person={selected} siblingNames={selected ? siblingNames(selected.id) : []} onClose={() => setSelected(null)} />
    </main>
  )
}

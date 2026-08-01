import { useMemo, useState } from 'react'
import peopleData from './data/people.json'
import relationshipData from './data/relationships.json'
import sourceData from './data/sources.json'
import type { Person, Relationship, Source } from './types/genealogy'
import { FamilyTree } from './components/FamilyTree'
import './styles.css'

const people = peopleData as Person[]
const relationships = relationshipData as Relationship[]
const sources = sourceData as Source[]

export default function App() {
  const [rootId, setRootId] = useState('charles-blouin')
  const [query, setQuery] = useState('')

  const matches = useMemo(() => query.trim() ? people.filter(p => p.names.display.toLowerCase().includes(query.toLowerCase())) : [], [query])

  return (
    <main>
      <header>
        <div><h1>Arbre généalogique</h1><p>Explorez les ancêtres et ouvrez une fiche pour voir les détails.</p></div>
        <div className="search-wrap">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une personne…" />
          {matches.length > 0 && <div className="search-results">{matches.map(p => <button key={p.id} onClick={() => { setRootId(p.id); setQuery('') }}>{p.names.display}</button>)}</div>}
        </div>
      </header>
      <FamilyTree people={people} relationships={relationships} sources={sources} rootId={rootId} />
    </main>
  )
}

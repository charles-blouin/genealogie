import { useMemo, useState } from 'react'
import type { Person, Relationship, Source } from '../types/genealogy'
import { PersonCard } from './PersonCard'

interface Props {
  people: Person[]
  relationships: Relationship[]
  sources: Source[]
  rootId: string
}

export function FamilyTree({ people, relationships, sources, rootId }: Props) {
  const peopleById = useMemo(() => new Map(people.map(person => [person.id, person])), [people])
  const [openBranches, setOpenBranches] = useState<Set<string>>(() => new Set([rootId]))
  const [expandedPeople, setExpandedPeople] = useState<Set<string>>(() => new Set())

  const ancestorIds = useMemo(() => {
    const found = new Set<string>()
    function visit(id: string) {
      if (found.has(id)) return
      found.add(id)
      relationships.filter(relationship => relationship.type.endsWith('parent') && relationship.personIds[1] === id).forEach(relationship => visit(relationship.personIds[0]))
    }
    visit(rootId)
    return found
  }, [relationships, rootId])

  function parentIds(childId: string) {
    return relationships.filter(relationship => relationship.type.endsWith('parent') && relationship.personIds[1] === childId).map(relationship => relationship.personIds[0])
  }

  function ancestorCount(personId: string, counted = new Set<string>()): number {
    for (const parentId of parentIds(personId)) {
      if (counted.has(parentId)) continue
      counted.add(parentId)
      ancestorCount(parentId, counted)
    }
    return counted.size
  }

  function toggleBranch(personId: string) {
    setOpenBranches(current => {
      const next = new Set(current)
      next.has(personId) ? next.delete(personId) : next.add(personId)
      return next
    })
  }

  function renderBranch(personId: string, visited = new Set<string>()): React.ReactNode {
    if (visited.has(personId)) return null
    const person = peopleById.get(personId)
    if (!person) return null
    const parents = parentIds(personId)
    const isOpen = openBranches.has(personId)
    const totalAncestors = ancestorCount(personId)
    const nextVisited = new Set(visited).add(personId)
    return <li key={personId}>
      <div className="tree-person">
        <PersonCard person={person} sources={sources} marriages={relationships.filter(relationship => relationship.type === 'marriage' && relationship.personIds.includes(personId))} expanded={expandedPeople.has(personId)} onToggle={() => setExpandedPeople(current => {
          const next = new Set(current); next.has(personId) ? next.delete(personId) : next.add(personId); return next
        })} />
        {parents.length > 0 && <button className="branch-toggle" onClick={() => toggleBranch(personId)} aria-expanded={isOpen} aria-label={isOpen ? 'Masquer les ancêtres' : 'Afficher les ancêtres'} title={`${totalAncestors} ancêtre${totalAncestors > 1 ? 's' : ''} direct${totalAncestors > 1 ? 's' : ''} connu${totalAncestors > 1 ? 's' : ''}`}>{isOpen ? '−' : '+'}<span>({totalAncestors})</span></button>}
      </div>
      {parents.length > 0 && isOpen && <ul>{parents.map(parentId => renderBranch(parentId, nextVisited))}</ul>}
    </li>
  }

  return <section className="tree-area" aria-label="Arbre généalogique">
    <div className="tree-controls">
      <button onClick={() => setOpenBranches(new Set(ancestorIds))}>Tout ouvrir</button>
      <button onClick={() => setOpenBranches(new Set())}>Tout fermer</button>
    </div>
    <div className="tree-scroll"><ul className="family-tree family-tree--vertical">{renderBranch(rootId)}</ul></div>
  </section>
}

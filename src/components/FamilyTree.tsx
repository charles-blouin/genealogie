import { useMemo } from 'react'
import type { Person, Relationship } from '../types/genealogy'
import { PersonCard } from './PersonCard'

interface Props {
  people: Person[]
  relationships: Relationship[]
  rootId: string
  onSelect: (person: Person) => void
}

export function FamilyTree({ people, relationships, rootId, onSelect }: Props) {
  const peopleById = useMemo(() => new Map(people.map(p => [p.id, p])), [people])

  function parentIds(childId: string) {
    return relationships
      .filter(r => r.type.endsWith('parent') && r.personIds[1] === childId)
      .map(r => r.personIds[0])
  }

  function renderBranch(personId: string, visited = new Set<string>()): React.ReactNode {
    if (visited.has(personId)) return null
    const person = peopleById.get(personId)
    if (!person) return null
    const nextVisited = new Set(visited).add(personId)
    const parents = parentIds(personId)

    return (
      <li key={personId}>
        <PersonCard person={person} onClick={() => onSelect(person)} />
        {parents.length > 0 && <ul>{parents.map(id => renderBranch(id, nextVisited))}</ul>}
      </li>
    )
  }

  return <div className="tree-scroll"><ul className="family-tree">{renderBranch(rootId)}</ul></div>
}

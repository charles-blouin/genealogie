import type { Person } from '../types/genealogy'

interface Props {
  person: Person
  onClick: () => void
}

export function PersonCard({ person, onClick }: Props) {
  const birth = person.birth?.date?.value
  const death = person.death?.date?.value
  const years = birth || death ? `${birth ?? '?'}–${death ?? (person.living ? '' : '?')}` : ''

  return (
    <button className="person-card" onClick={onClick} title={person.summary ?? person.displayName}>
      <strong>{person.displayName}</strong>
      {years && <span>{years}</span>}
      {person.occupations?.[0] && <small>{person.occupations[0].title}</small>}
    </button>
  )
}

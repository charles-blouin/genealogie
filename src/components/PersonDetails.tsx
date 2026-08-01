import type { Person } from '../types/genealogy'

interface Props {
  person: Person | null
  siblingNames: string[]
  onClose: () => void
}

export function PersonDetails({ person, siblingNames, onClose }: Props) {
  if (!person) return null

  return (
    <aside className="details-panel">
      <button className="close-button" onClick={onClose} aria-label="Close details">×</button>
      <h2>{person.displayName}</h2>
      {person.summary && <p>{person.summary}</p>}
      <dl>
        <dt>Born</dt><dd>{person.birth?.date?.value ?? 'Unknown'}{person.birth?.place?.name ? ` — ${person.birth.place.name}` : ''}</dd>
        <dt>Died</dt><dd>{person.living ? 'Living' : person.death?.date?.value ?? 'Unknown'}</dd>
        <dt>Siblings</dt><dd>{siblingNames.length ? `${siblingNames.length}: ${siblingNames.join(', ')}` : 'None recorded'}</dd>
      </dl>
      {!!person.occupations?.length && <><h3>Occupations</h3><ul>{person.occupations.map((o, i) => <li key={i}>{o.title}{o.organization ? ` — ${o.organization}` : ''}</li>)}</ul></>}
      {!!person.stories?.length && <><h3>Stories</h3>{person.stories.map((s, i) => <section key={i}><h4>{s.title}</h4><p>{s.text}</p></section>)}</>}
    </aside>
  )
}

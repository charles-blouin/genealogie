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
      <button className="close-button" onClick={onClose} aria-label="Fermer les détails">×</button>
      <h2>{person.displayName}</h2>
      {person.summary && <p>{person.summary}</p>}
      <dl>
        <dt>Naissance</dt><dd>{person.birth?.date?.value ?? 'Inconnue'}{person.birth?.place?.name ? ` — ${person.birth.place.name}` : ''}</dd>
        <dt>Décès</dt><dd>{person.living ? 'Personne vivante' : person.death?.date?.value ?? 'Inconnu'}</dd>
        <dt>Fratrie</dt><dd>{siblingNames.length ? `${siblingNames.length} : ${siblingNames.join(', ')}` : 'Aucune personne enregistrée'}</dd>
      </dl>
      {!!person.occupations?.length && <><h3>Occupations</h3><ul>{person.occupations.map((o, i) => <li key={i}>{o.title}{o.organization ? ` — ${o.organization}` : ''}</li>)}</ul></>}
      {!!person.stories?.length && <><h3>Récits</h3>{person.stories.map((s, i) => <section key={i}><h4>{s.title}</h4><p>{s.text}</p></section>)}</>}
    </aside>
  )
}

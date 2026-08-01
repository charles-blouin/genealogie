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
      <h2>{person.names.display}</h2>
      {person.biography?.summary && <p>{person.biography.summary}</p>}
      <dl>
        <dt>Naissance</dt><dd>{person.birth?.date?.value ?? 'Inconnue'}{person.birth?.place?.name ? ` — ${person.birth.place.name}` : ''}</dd>
        <dt>Décès</dt><dd>{person.living ? 'Personne vivante' : person.death?.date?.value ?? 'Inconnu'}</dd>
        <dt>Fratrie</dt><dd>{siblingNames.length ? `${siblingNames.length} : ${siblingNames.join(', ')}` : 'Aucune personne enregistrée'}</dd>
      </dl>
      {!!person.occupations?.length && <><h3>Occupations</h3><ul>{person.occupations.map((occupation, index) => <li key={index}>{occupation.title}{occupation.organization ? ` — ${occupation.organization}` : ''}</li>)}</ul></>}
      {!!person.biography?.stories?.length && <><h3>Récits</h3>{person.biography.stories.map((story, index) => <section key={index}><h4>{story.title}</h4><p>{story.text}</p></section>)}</>}
      {!!person.biography?.researchQuestions?.length && <><h3>Questions de recherche</h3><ul>{person.biography.researchQuestions.map((question, index) => <li key={index}>{question}</li>)}</ul></>}
    </aside>
  )
}

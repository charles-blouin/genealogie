import { useState } from 'react'
import type { Person, Relationship, Source } from '../types/genealogy'

interface Props { person: Person; sources: Source[]; marriages: Relationship[]; expanded: boolean; onToggle: () => void }
function dateNaissance(person: Person) { return person.birth?.date?.value ?? 'Date de naissance inconnue' }
function lieuAssocie(person: Person) { return person.birth?.place?.name ?? person.death?.place?.name ?? 'Lieu inconnu' }
function sourcesDeLaPersonne(person: Person, sources: Source[]) {
  const ids = new Set([...(person.sourceIds ?? []), ...(person.birth?.sourceIds ?? []), ...(person.death?.sourceIds ?? []), ...(person.biography?.stories ?? []).flatMap(story => story.sourceIds ?? [])])
  return sources.filter(source => ids.has(source.id))
}

export function PersonCard({ person, sources, marriages, expanded, onToggle }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const personSources = sourcesDeLaPersonne(person, sources)
  return <article className={`person-card ${expanded ? 'is-expanded' : ''}`}>
    <button className="person-card__summary" onClick={onToggle} aria-expanded={expanded}>
      <span className="person-card__name">{person.names.display}</span><span className="person-card__vital">{dateNaissance(person)}</span><span className="person-card__place">{lieuAssocie(person)}</span><span className="person-card__toggle" aria-hidden="true">{expanded ? '−' : '+'}</span>
    </button>
    {expanded && <div className="person-card__details">
      {person.biography?.summary && <p>{person.biography.summary}</p>}
      <dl><dt>Naissance</dt><dd>{dateNaissance(person)}{person.birth?.place?.name ? ` — ${person.birth.place.name}` : ''}</dd><dt>Mariage</dt><dd>{marriages.length ? marriages.map(marriage => `${marriage.start?.date?.value ?? 'Date inconnue'}${marriage.start?.place?.name ? ` — ${marriage.start.place.name}` : ''}`).join('; ') : 'Inconnu'}</dd><dt>Décès</dt><dd>{person.living ? 'Personne vivante' : person.death?.date?.value ?? 'Inconnu'}{person.death?.place?.name ? ` — ${person.death.place.name}` : ''}</dd>{person.names.alternate.length > 0 && <><dt>Autres noms</dt><dd>{person.names.alternate.join(', ')}</dd></>}</dl>
      {!!person.occupations?.length && <section><h3>Occupations</h3><ul>{person.occupations.map((o, i) => <li key={i}>{o.title}{o.organization ? ` — ${o.organization}` : ''}</li>)}</ul></section>}
      {!!person.tags?.length && <p className="person-card__tags">{person.tags.map(tag => <span key={tag}>{tag}</span>)}</p>}
      {!!person.biography?.stories?.length && <section>{person.biography.stories.map((story, i) => <div key={i}><h3>{story.title}</h3><p>{story.text}</p></div>)}</section>}
      <section className="source-menu"><button onClick={() => setSourcesOpen(open => !open)} aria-expanded={sourcesOpen}>Sources ({personSources.length})</button>{sourcesOpen && <ul>{personSources.length ? personSources.map(source => <li key={source.id}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title}{source.repository ? ` — ${source.repository}` : ''}{source.notes ? ` (${source.notes})` : ''}</li>) : <li>Aucune source liée à cette fiche.</li>}</ul>}</section>
    </div>}
  </article>
}

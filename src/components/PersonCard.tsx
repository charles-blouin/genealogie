import { useState } from 'react'
import type { ConfidenceLevel, EvidenceType, Person, Relationship, Source } from '../types/genealogy'

interface Props { person: Person; sources: Source[]; marriages: Relationship[]; expanded: boolean; onToggle: () => void }
function dateNaissance(person: Person) { return person.birth?.date?.value ?? 'Date de naissance inconnue' }
function lieuAssocie(person: Person) { return person.birth?.place?.name ?? person.death?.place?.name ?? 'Lieu inconnu' }
function sourcesDeLaPersonne(person: Person, sources: Source[]) {
  const ids = new Set([...(person.sourceIds ?? []), ...(person.birth?.sourceIds ?? []), ...(person.death?.sourceIds ?? []), ...(person.biography?.stories ?? []).flatMap(story => story.sourceIds ?? [])])
  return sources.filter(source => ids.has(source.id))
}
const confidenceLabel: Record<ConfidenceLevel, string> = { confirmed: 'Confirmé', probable: 'Probable', hypothesis: 'Hypothèse' }
const evidenceLabel: Record<EvidenceType, string> = {
  primary: 'Source primaire',
  'official-secondary': 'Source officielle secondaire',
  secondary: 'Source secondaire',
  compiled: 'Compilation généalogique',
  'family-tradition': 'Tradition familiale',
  'research-guide': 'Guide de recherche',
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
      <dl><dt>Naissance</dt><dd>{dateNaissance(person)}{person.birth?.place?.name ? ` — ${person.birth.place.name}` : ''}</dd><dt>Mariage</dt><dd>{marriages.length ? marriages.map(marriage => `${marriage.start?.date?.value ?? 'Date inconnue'}${marriage.start?.place?.name ? ` — ${marriage.start.place.name}` : ''}`).join('; ') : 'Inconnu'}</dd><dt>Décès</dt><dd>{person.death?.date?.value ?? 'Inconnu'}{person.death?.place?.name ? ` — ${person.death.place.name}` : ''}</dd>{person.names.alternate.length > 0 && <><dt>Autres noms</dt><dd>{person.names.alternate.join(', ')}</dd></>}</dl>
      {!!person.occupations?.length && <section><h3>Occupations</h3><ul>{person.occupations.map((o, i) => <li key={i}>{o.title}{o.organization ? ` — ${o.organization}` : ''}</li>)}</ul></section>}
      {!!person.tags?.length && <p className="person-card__tags">{person.tags.map(tag => <span key={tag}>{tag}</span>)}</p>}
      {!!person.biography?.stories?.length && <section>{person.biography.stories.map((story, i) => <div className="story" key={i}><h3>{story.title}{story.confidence && <span className={`confidence confidence--${story.confidence}`}>{confidenceLabel[story.confidence]}</span>}</h3><p>{story.text}</p></div>)}</section>}
      {!!person.biography?.researchQuestions?.length && <section className="research-questions"><h3>Questions ouvertes</h3><ul>{person.biography.researchQuestions.map((question, i) => <li key={i}>{question}</li>)}</ul></section>}
      <section className="source-menu"><button onClick={() => setSourcesOpen(open => !open)} aria-expanded={sourcesOpen}>Sources ({personSources.length})</button>{sourcesOpen && <ul>{personSources.length ? personSources.map(source => <li key={source.id}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title}{source.repository ? ` — ${source.repository}` : ''}<span className="source-meta">{source.evidenceType ? evidenceLabel[source.evidenceType] : source.type}{source.confidence ? ` · ${confidenceLabel[source.confidence]}` : ''}</span>{source.notes ? <small>{source.notes}</small> : null}</li>) : <li>Aucune source liée à cette fiche.</li>}</ul>}</section>
    </div>}
  </article>
}

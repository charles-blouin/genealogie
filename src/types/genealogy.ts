export type DatePrecision = 'exact' | 'day' | 'month' | 'year' | 'decade' | 'unknown'
export type DateQualifier = 'exact' | 'about' | 'before' | 'after' | 'between' | 'estimated'

export interface GenealogyDate {
  value?: string
  precision: DatePrecision
  qualifier?: DateQualifier
  endValue?: string
}

export interface Place {
  name: string
  latitude?: number
  longitude?: number
}

export interface LifeEvent {
  date?: GenealogyDate
  place?: Place
  notes?: string
  sourceIds?: string[]
}

export interface Occupation {
  title: string
  organization?: string
  from?: string
  to?: string
  notes?: string
}

export interface Story {
  title: string
  text: string
  sourceIds?: string[]
}

export interface Person {
  id: string
  displayName: string
  givenNames: string[]
  surnameAtBirth: string
  alternateNames?: string[]
  sex?: 'female' | 'male' | 'intersex' | 'unknown'
  living?: boolean
  birth?: LifeEvent
  death?: LifeEvent
  occupations?: Occupation[]
  summary?: string
  stories?: Story[]
  photo?: string
  sourceIds?: string[]
  tags?: string[]
}

export type RelationshipType =
  | 'biological-parent'
  | 'adoptive-parent'
  | 'step-parent'
  | 'foster-parent'
  | 'marriage'
  | 'common-law'
  | 'engagement'

export interface Relationship {
  id: string
  type: RelationshipType
  personIds: string[]
  start?: LifeEvent
  end?: LifeEvent
  sourceIds?: string[]
  notes?: string
}

export interface Source {
  id: string
  type: string
  title: string
  repository?: string
  reference?: string
  url?: string
  accessed?: string
  notes?: string
}

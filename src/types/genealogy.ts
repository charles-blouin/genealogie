export type DatePrecision = 'exact' | 'day' | 'month' | 'year' | 'decade' | 'unknown'
export type DateQualifier = 'exact' | 'about' | 'before' | 'after' | 'between' | 'estimated'
export type ConfidenceLevel = 'confirmed' | 'probable' | 'hypothesis'
export type EvidenceType = 'primary' | 'official-secondary' | 'secondary' | 'compiled' | 'family-tradition' | 'research-guide'

export interface GenealogyDate { value?: string; precision: DatePrecision; qualifier?: DateQualifier; endValue?: string }
export interface Place { name: string; coordinates?: { latitude: number; longitude: number } }
export interface LifeEvent { date?: GenealogyDate; place?: Place; notes?: string; sourceIds?: string[] }
export interface Occupation { title: string; organization?: string; from?: string; to?: string; notes?: string }
export interface Story { title: string; text: string; sourceIds?: string[]; confidence?: ConfidenceLevel }
export interface ResearchProfile { personId: string; stories?: Story[]; researchQuestions?: string[] }

export interface Person {
  id: string
  names: { given: string[]; surnameAtBirth: string; display: string; alternate: string[] }
  sex?: 'female' | 'male' | 'intersex' | 'unknown'
  living?: boolean
  birth?: LifeEvent
  death: LifeEvent | null
  occupations?: Occupation[]
  residences?: LifeEvent[]
  biography?: { summary?: string; stories?: Story[]; researchQuestions?: string[] }
  photos?: Array<{ path: string; caption?: string; year?: number }>
  sourceIds?: string[]
  tags?: string[]
  private?: boolean
  notes?: string
}

export type RelationshipType = 'biological-parent' | 'adoptive-parent' | 'step-parent' | 'foster-parent' | 'marriage' | 'common-law' | 'engagement'
export interface Relationship { id: string; type: RelationshipType; personIds: string[]; start?: LifeEvent; end?: LifeEvent; sourceIds?: string[]; notes?: string }
export interface Source { id: string; type: string; title: string; repository?: string; reference?: string; url?: string; accessed?: string; notes?: string; evidenceType?: EvidenceType; confidence?: ConfidenceLevel }

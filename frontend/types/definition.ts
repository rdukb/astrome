/**
 * Term definition types for glossary/tooltip features.
 */

export type DefinitionLanguage = 'en' | 'ta' | 'both';

export interface TermDefinition {
  term_id: string;
  name_en?: string | null;
  name_ta?: string | null;
  short_definition_en?: string | null;
  short_definition_ta?: string | null;
  detailed_explanation_en?: string | null;
  detailed_explanation_ta?: string | null;
  significance_tradition?: string | null;
  calculation_method?: string | null;
  related_terms?: string[] | null;
  sources?: string[] | null;
  icon?: string | null;
}

export interface TermDefinitionsResponse {
  definitions: TermDefinition[];
  count: number;
  language: DefinitionLanguage;
}

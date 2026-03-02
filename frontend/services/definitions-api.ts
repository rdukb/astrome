/**
 * Definitions API service.
 */

import { apiClient } from './api-client';
import type { DefinitionLanguage, TermDefinition, TermDefinitionsResponse } from '@/types/definition';

/**
 * Fetch all term definitions.
 */
export const fetchDefinitions = async (
  language: DefinitionLanguage = 'both'
): Promise<TermDefinition[]> => {
  const response = await apiClient.get<TermDefinitionsResponse>('/api/v1/definitions', {
    params: { language },
  });

  return response.data.definitions;
};

/**
 * Fetch single term definition by term ID.
 */
export const fetchDefinition = async (termId: string): Promise<TermDefinition> => {
  const response = await apiClient.get<TermDefinition>(`/api/v1/definitions/${termId}`);
  return response.data;
};

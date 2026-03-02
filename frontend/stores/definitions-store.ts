/**
 * Zustand store for term definitions.
 */

import { fetchDefinition, fetchDefinitions } from '@/services/definitions-api';
import type { DefinitionLanguage, TermDefinition } from '@/types/definition';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

interface DefinitionsState {
  definitions: Record<string, TermDefinition>;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  language: DefinitionLanguage;

  preloadDefinitions: (language?: DefinitionLanguage) => Promise<void>;
  fetchDefinitionById: (termId: string) => Promise<TermDefinition | undefined>;
  getDefinition: (termId: string) => TermDefinition | undefined;
  clearDefinitionsCache: () => void;
}

export const useDefinitionsStore = create<DefinitionsState>()(
  devtools(
    persist(
      (set, get) => ({
        definitions: {},
        isLoading: false,
        error: null,
        hasLoaded: false,
        language: 'both',

        preloadDefinitions: async (language: DefinitionLanguage = 'both') => {
          if (get().hasLoaded && get().language === language) {
            return;
          }

          set({ isLoading: true, error: null });
          try {
            const items = await fetchDefinitions(language);
            const map = items.reduce<Record<string, TermDefinition>>((acc, item) => {
              acc[item.term_id] = item;
              return acc;
            }, {});

            set({
              definitions: map,
              hasLoaded: true,
              isLoading: false,
              error: null,
              language,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load term definitions',
            });
          }
        },

        fetchDefinitionById: async (termId: string) => {
          const existing = get().definitions[termId];
          if (existing) {
            return existing;
          }

          try {
            const definition = await fetchDefinition(termId);
            set((state) => ({
              definitions: {
                ...state.definitions,
                [termId]: definition,
              },
            }));
            return definition;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : `Failed to load term: ${termId}`,
            });
            return undefined;
          }
        },

        getDefinition: (termId: string) => get().definitions[termId],

        clearDefinitionsCache: () =>
          set({
            definitions: {},
            hasLoaded: false,
            error: null,
            language: 'both',
          }),
      }),
      {
        name: 'definitions-store',
        storage: createJSONStorage(() => localStorage),
        version: 1,
        partialize: (state) => ({
          definitions: state.definitions,
          hasLoaded: state.hasLoaded,
          language: state.language,
        }),
      }
    ),
    { name: 'DefinitionsStore' }
  )
);

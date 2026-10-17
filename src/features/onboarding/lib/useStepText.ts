import { useAtom } from '@reatom/npm-react'
import { dynamicSectionsAtom } from 'entities/section'
import { buildSectionTitlesPhrase, SECTION_TITLES_TOKEN } from './sectionTitlesPhrase'

export const useStepText = (text: string | undefined): string | undefined => {
  const [sections] = useAtom(dynamicSectionsAtom)

  if (!text || !text.includes(SECTION_TITLES_TOKEN)) return text

  return text.replace(SECTION_TITLES_TOKEN, buildSectionTitlesPhrase(sections))
}

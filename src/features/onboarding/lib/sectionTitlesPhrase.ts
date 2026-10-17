import { type SectionData } from 'entities/section'

export const SECTION_TITLES_TOKEN = '{sectionTitles}'

const FALLBACK_PHRASE = 'разделы — например, «По Библии», «По темам»'
const MAX_VISIBLE_TITLES = 2

export const buildSectionTitlesPhrase = (sections: SectionData[]): string => {
  const titles = sections.flatMap(section => (section.title ? [section.title] : []))

  if (titles.length === 0) return FALLBACK_PHRASE

  const visible = titles
    .slice(0, MAX_VISIBLE_TITLES)
    .map(title => `«${title}»`)
    .join(', ')
  const suffix = titles.length > MAX_VISIBLE_TITLES ? ' и другие' : ''

  return `разделы ${visible}${suffix}`
}

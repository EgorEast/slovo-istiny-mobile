import { type SectionData } from 'entities/section'
import { buildSectionTitlesPhrase } from './sectionTitlesPhrase'

const BIBLE = 'По Библии'
const TOPICS = 'По темам'
const FALLBACK = 'разделы — например, «По Библии», «По темам»'

const buildSection = (title?: string): SectionData => ({
  itemsSize: 'middle',
  title,
  transform: 'middle',
})

describe('buildSectionTitlesPhrase', () => {
  test('falls back to the placeholder when there are no sections', () => {
    expect(buildSectionTitlesPhrase([])).toBe(FALLBACK)
  })

  test('falls back to the placeholder when no section carries a title', () => {
    expect(buildSectionTitlesPhrase([buildSection(), buildSection()])).toBe(FALLBACK)
  })

  test('lists a single title', () => {
    expect(buildSectionTitlesPhrase([buildSection(BIBLE)])).toBe(`разделы «${BIBLE}»`)
  })

  test('lists exactly two titles without a trailing ellipsis', () => {
    const sections = [buildSection(BIBLE), buildSection(TOPICS)]

    expect(buildSectionTitlesPhrase(sections)).toBe(`разделы «${BIBLE}», «${TOPICS}»`)
  })

  test('shows only the first two titles and appends a trailing ellipsis', () => {
    const sections = [buildSection(BIBLE), buildSection(TOPICS), buildSection('По книгам')]

    expect(buildSectionTitlesPhrase(sections)).toBe(`разделы «${BIBLE}», «${TOPICS}» и другие`)
  })
})

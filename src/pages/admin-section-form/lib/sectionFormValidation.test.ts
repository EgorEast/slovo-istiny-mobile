import { type SectionFormValues } from './sectionFormState'
import { sectionValidationError } from './sectionFormValidation'

const baseValues = (overrides: Partial<SectionFormValues> = {}): SectionFormValues => ({
  borderRadius: true,
  description: '',
  isDescriptionTitleOnSlideLarge: false,
  itemsRows: '',
  itemsSize: 'middle',
  selectedPlaylistIds: [],
  title: 'Последние проповеди',
  transform: 'high',
  whereIsSlideTitleLocated: 'on',
  ...overrides,
})

describe('sectionValidationError', () => {
  test('accepts a valid form', () => {
    expect(sectionValidationError(baseValues())).toBe('')
  })

  test('reports overlong text fields', () => {
    expect(sectionValidationError(baseValues({ title: 'a'.repeat(301) }))).toBe(
      'Название: не более 300 символов.',
    )
    expect(sectionValidationError(baseValues({ description: 'a'.repeat(10001) }))).toBe(
      'Описание: не более 10000 символов.',
    )
  })

  test('rejects more than 100 slider rows', () => {
    expect(sectionValidationError(baseValues({ itemsRows: '101' }))).toBe('Строк: не более 100.')
    expect(sectionValidationError(baseValues({ itemsRows: '100' }))).toBe('')
  })

  test('limits the playlists relation array', () => {
    const selectedPlaylistIds = Array.from({ length: 1001 }, (_, index) => `p${index}`)

    expect(sectionValidationError(baseValues({ selectedPlaylistIds }))).toBe(
      'Плейлисты: не более 1000 значений.',
    )
  })
})

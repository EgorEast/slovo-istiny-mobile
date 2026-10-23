import { type PlaylistFormValues } from './playlistFormState'
import { playlistValidationError } from './playlistFormValidation'

const baseValues = (overrides: Partial<PlaylistFormValues> = {}): PlaylistFormValues => ({
  artwork: 'https://cdn.example/files/cover.jpg',
  description: '',
  selectedSectionIds: [],
  selectedSermonIds: [],
  title: 'Воскресные проповеди',
  ...overrides,
})

describe('playlistValidationError', () => {
  test('accepts a valid form', () => {
    expect(playlistValidationError(baseValues())).toBe('')
  })

  test('reports overlong text fields', () => {
    expect(playlistValidationError(baseValues({ title: 'a'.repeat(301) }))).toBe(
      'Название: не более 300 символов.',
    )
    expect(playlistValidationError(baseValues({ description: 'a'.repeat(10001) }))).toBe(
      'Описание: не более 10000 символов.',
    )
    expect(playlistValidationError(baseValues({ artwork: 'a'.repeat(2049) }))).toBe(
      'Обложка: не более 2048 символов.',
    )
  })

  test('limits the relation arrays', () => {
    const selectedSermonIds = Array.from({ length: 1001 }, (_, index) => `s${index}`)

    expect(playlistValidationError(baseValues({ selectedSermonIds }))).toBe(
      'Проповеди: не более 1000 значений.',
    )
  })
})

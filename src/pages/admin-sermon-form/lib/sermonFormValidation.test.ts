import { initialFormValues, type SermonFormValues } from './sermonFormInitialValues'
import { sermonValidationError } from './sermonFormValidation'

const baseValues = (overrides: Partial<SermonFormValues> = {}): SermonFormValues => ({
  ...initialFormValues(null),
  artist: 'Иоанн',
  title: 'Сила веры',
  ...overrides,
})

const FILE_URL = 'https://cdn.example/files/sermon.mp3'

describe('sermonValidationError', () => {
  test('accepts a minimal valid form', () => {
    expect(sermonValidationError(baseValues())).toBe('')
  })

  test('reports overlong text fields', () => {
    expect(sermonValidationError(baseValues({ title: 'a'.repeat(301) }))).toBe(
      'Название: не более 300 символов.',
    )
    expect(sermonValidationError(baseValues({ artist: 'a'.repeat(201) }))).toBe(
      'Проповедник: не более 200 символов.',
    )
    expect(sermonValidationError(baseValues({ book: 'a'.repeat(101) }))).toBe(
      'Книга: не более 100 символов.',
    )
    expect(sermonValidationError(baseValues({ description: 'a'.repeat(10001) }))).toBe(
      'Описание: не более 10000 символов.',
    )
    expect(sermonValidationError(baseValues({ artwork: 'a'.repeat(2049) }))).toBe(
      'Обложка: не более 2048 символов.',
    )
  })

  test('accepts media links pointing at the file storage', () => {
    expect(sermonValidationError(baseValues({ audioUrl: FILE_URL, textFileUrl: FILE_URL }))).toBe(
      '',
    )
  })

  test('rejects audio and text links outside the file storage', () => {
    expect(sermonValidationError(baseValues({ audioUrl: 'https://example.com/a.mp3' }))).toBe(
      'Аудио: ссылка должна указывать на файл в хранилище (…/files/…).',
    )
    expect(sermonValidationError(baseValues({ textFileUrl: '/local/file.pdf' }))).toBe(
      'Текст: ссылка должна указывать на файл в хранилище (…/files/…).',
    )
  })

  test('rejects a malformed youtube link and accepts a valid one', () => {
    expect(sermonValidationError(baseValues({ youtubeUrl: 'youtube.com/watch' }))).toBe(
      'YouTube: укажите корректную ссылку.',
    )
    expect(sermonValidationError(baseValues({ youtubeUrl: 'https://youtu.be/abc' }))).toBe('')
  })

  test('reports an overlong media link before its format', () => {
    expect(
      sermonValidationError(baseValues({ youtubeUrl: `https://youtu.be/${'a'.repeat(2048)}` })),
    ).toBe('YouTube: не более 2048 символов.')
  })

  test('limits the playlists relation array', () => {
    const selectedPlaylistIds = Array.from({ length: 1001 }, (_, index) => `p${index}`)

    expect(sermonValidationError(baseValues({ selectedPlaylistIds }))).toBe(
      'Плейлисты: не более 1000 значений.',
    )
  })
})

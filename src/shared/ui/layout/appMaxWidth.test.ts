import { INDENTS } from '../theme/themed'
import { APP_MAX_CONTENT_WIDTH, CONTENT_COLUMN_WIDTH, getColumnSideInset } from './appMaxWidth'

// Инвариант бокового отступа — единый источник истины для трёх слоёв геометрии
// (свёрнутый мини-плеер, анимация раскрытия, стили покоя). Таблица фиксирует
// поведение на границах: телефон, кромка полосы, центрирование. Полоса передаётся
// явно — дефолт `APP_MAX_CONTENT_WIDTH` существует только на web.
describe('getColumnSideInset', () => {
  test('native default has no cap', () => {
    expect(APP_MAX_CONTENT_WIDTH).toBeUndefined()
  })

  test.each([
    // phone: narrower than the band → floor branch keeps minInset
    { expected: 8, minInset: INDENTS.low, width: 599 },
    // band edge: exactly the column width
    { expected: 8, minInset: INDENTS.low, width: 600 },
    // centered inset (5px) is below minInset → Math.max picks minInset
    { expected: 8, minInset: INDENTS.low, width: 610 },
    // centered inset equals minInset
    { expected: 8, minInset: INDENTS.low, width: 616 },
    // centered inset (10px) overtakes minInset
    { expected: 10, minInset: INDENTS.low, width: 620 },
    // wide desktop viewport
    { expected: 100, minInset: INDENTS.low, width: 800 },
    // minInset above the centered inset wins
    { expected: 100, minInset: 24, width: 800 },
  ])('width=$width, minInset=$minInset → $expected', ({ expected, minInset, width }) => {
    expect(getColumnSideInset(width, minInset, CONTENT_COLUMN_WIDTH)).toBe(expected)
  })

  test('explicit undefined cap on a wide viewport returns minInset', () => {
    expect(getColumnSideInset(800, INDENTS.low, undefined)).toBe(8)
  })
})

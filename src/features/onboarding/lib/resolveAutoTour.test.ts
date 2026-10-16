import { resolveAutoTour } from './resolveAutoTour'

describe('resolveAutoTour', () => {
  test('plays the welcome tour when no version was seen yet', () => {
    expect(resolveAutoTour(null, '1.2.0')).toBe('welcome')
  })

  test('plays the whats-new tour when the version changed', () => {
    expect(resolveAutoTour('1.1.0', '1.2.0')).toBe('whatsNew')
  })

  test('plays nothing when the current version was already seen', () => {
    expect(resolveAutoTour('1.2.0', '1.2.0')).toBeNull()
  })
})

import { resolveStepRoute, scenariosById } from './scenarios'

describe('onboarding scenario data', () => {
  test('welcome runs eight steps and ends on the tours setting', () => {
    const welcome = scenariosById.welcome

    expect(welcome.steps).toHaveLength(8)
    expect(welcome.steps[7].targetId).toBe('settings.tours')
  })

  test('whats-new is a release scenario pinned to a version', () => {
    expect(scenariosById.whatsNew.sinceVersion).toBeTruthy()
  })
})

describe('resolveStepRoute', () => {
  test('returns the step route when the step declares one', () => {
    expect(resolveStepRoute(scenariosById.settings, 1)).toBe('/settings')
  })

  test('inherits the nearest previous route for a routeless step', () => {
    // playlists step 2 («Добавить проповедь») has no route of its own.
    expect(resolveStepRoute(scenariosById.playlists, 2)).toBe('/listen/my-playlists')
  })

  test('returns undefined when no preceding step declares a route', () => {
    expect(
      resolveStepRoute({ ...scenariosById.whatsNew, steps: [{ text: '', title: '' }] }, 0),
    ).toBe(undefined)
  })
})

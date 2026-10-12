import { scenariosById } from './scenarios'

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

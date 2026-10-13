import { resolveStepRoute, scenariosById } from './scenarios'

describe('onboarding scenario data', () => {
  test('welcome runs seven steps and ends on the tours setting', () => {
    const welcome = scenariosById.welcome

    expect(welcome.steps).toHaveLength(7)
    expect(welcome.steps[6].targetId).toBe('settings.tours')
  })

  test('welcome wires tap hints for the tab and the settings row', () => {
    const welcome = scenariosById.welcome

    expect(welcome.steps[4].tapTargetId).toBe('tab.more')
    expect(welcome.steps[5].tapTargetId).toBe('more.settings-item')
  })

  test('player scenario waits for the user to select a sermon and pause', () => {
    const player = scenariosById.player

    expect(player.steps).toHaveLength(3)
    expect(player.steps[0].waitFor).toBe('sermonSelected')
    expect(player.steps[0].tapTargetId).toBe('tab.listen')
    expect(player.steps[1].targetId).toBe('player.mini')
    expect(player.steps[2].targetId).toBe('player.mini')
    expect(player.steps[2].waitFor).toBe('paused')
  })

  test('whats-new is a release scenario pinned to a version', () => {
    expect(scenariosById.whatsNew.sinceVersion).toBeTruthy()
  })

  test('each scenario wires the tab or row it taps when navigating', () => {
    expect(scenariosById.listen.steps[0].tapTargetId).toBe('tab.listen')
    expect(scenariosById.playlists.steps[1].tapTargetId).toBe('listen.my-playlists')
    expect(scenariosById.history.steps[0].tapTargetId).toBe('tab.more')
    expect(scenariosById.history.steps[1].tapTargetId).toBe('more.history-item')
    expect(scenariosById.offline.steps[0].tapTargetId).toBe('tab.more')
    expect(scenariosById.offline.steps[1].tapTargetId).toBe('more.offline-item')
    expect(scenariosById.settings.steps[0].tapTargetId).toBe('tab.more')
    expect(scenariosById.settings.steps[1].tapTargetId).toBe('more.settings-item')
    expect(scenariosById.read.steps[0].tapTargetId).toBe('tab.read')
    expect(scenariosById.study.steps[0].tapTargetId).toBe('tab.study')
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

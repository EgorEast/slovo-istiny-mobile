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

  test('share scenario walks the QR code, copy button and link contents', () => {
    const share = scenariosById.share

    expect(share.screens).toEqual(['/share'])
    expect(share.steps).toHaveLength(3)
    expect(share.steps[0].targetId).toBe('share.qr')
    expect(share.steps[1].targetId).toBe('share.copy')
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

  test('player-scope scenarios are scoped to the player and never route-bound', () => {
    const playerScenarioIds = [
      'player-intro',
      'player-description',
      'player-speed',
      'player-sound',
    ] as const

    playerScenarioIds.forEach(id => {
      const scenario = scenariosById[id]

      expect(scenario.scope).toBe('player')
      expect(scenario.screens).toBeUndefined()
    })
  })

  test('player-intro walks edges, controls, repeat, playlist and menu', () => {
    const intro = scenariosById['player-intro']

    expect(intro.steps).toHaveLength(5)
    expect(intro.steps[0].targetId).toBeUndefined()
    expect(intro.steps[1].targetId).toBe('player-fullscreen.controls')
    expect(intro.steps[2].targetId).toBe('player-fullscreen.repeat')
    expect(intro.steps[3].targetId).toBe('player-fullscreen.playlist')
    expect(intro.steps[4].targetId).toBe('player-fullscreen.menu')
  })

  test('menu-driven player scenarios open the player menu first', () => {
    const menuTargetId = 'player-fullscreen.menu'

    expect(scenariosById['player-description'].steps[0].targetId).toBe(menuTargetId)
    expect(scenariosById['player-speed'].steps[0].targetId).toBe(menuTargetId)
    expect(scenariosById['player-sound'].steps[0].targetId).toBe(menuTargetId)
  })

  test('search scenario groups the results and lives on /listen', () => {
    const search = scenariosById.search

    expect(search.screens).toEqual(['/listen'])
    expect(search.steps).toHaveLength(3)
    expect(search.steps[0].targetId).toBe('search-results.group-sermons')
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

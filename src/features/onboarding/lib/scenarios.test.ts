import { resolveStepRoute } from './resolveStepRoute'
import { scenariosById } from './scenarios'

const FIRST_ROW_TARGET_ID = 'playlist.first-row'
const ROW_MENU_ADD_TARGET_ID = 'playlist.row-menu-add'

describe('onboarding scenario data', () => {
  test('welcome runs eight steps and ends on the tours setting', () => {
    const welcome = scenariosById.welcome

    expect(welcome.steps).toHaveLength(8)
    expect(welcome.steps[1].targetId).toBe('app.help-button')
    expect(welcome.steps[7].targetId).toBe('settings.tours')
  })

  test('welcome wires tap hints for the tab and the settings row', () => {
    const welcome = scenariosById.welcome

    expect(welcome.steps[5].tapTargetId).toBe('tab.more')
    expect(welcome.steps[6].tapTargetId).toBe('more.settings-item')
  })

  test('player scenario is global, offered from every screen picker', () => {
    expect(scenariosById.player.screens).toBeUndefined()
  })

  test('player scenario waits for the user to select a sermon and pause', () => {
    const player = scenariosById.player

    expect(player.steps).toHaveLength(4)
    expect(player.steps[0].waitFor).toBe('sermonSelected')
    expect(player.steps[0].tapTargetId).toBe('tab.listen')
    expect(player.steps[1].targetId).toBe('player.mini')
    expect(player.steps[2].targetId).toBe('player.mini-play-pause')
    expect(player.steps[2].waitFor).toBe('paused')
  })

  test('player scenario ends by expanding the mini player to fullscreen itself', () => {
    const expandStep = scenariosById.player.steps[3]

    expect(expandStep.targetId).toBe('player.mini')
    expect(expandStep.tapTargetId).toBe('player.mini')
    expect(expandStep.tapActionId).toBe('expand-player')
  })

  test('whats-new is a release scenario pinned to a version', () => {
    expect(scenariosById.whatsNew.sinceVersion).toBeTruthy()
  })

  test('whats-new spotlights the help button in its first step', () => {
    const whatsNew = scenariosById.whatsNew

    expect(whatsNew.steps[0].targetId).toBe('app.help-button')
    expect(whatsNew.steps[0].title).toBe('Обзоры в приложении')
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
    expect(scenariosById.history.steps[1].tapTargetId).toBe('tab.more')
    expect(scenariosById.history.steps[2].tapTargetId).toBe('more.history-item')
    expect(scenariosById.offline.steps[1].tapTargetId).toBe('tab.more')
    expect(scenariosById.offline.steps[2].tapTargetId).toBe('more.offline-item')
    expect(scenariosById.settings.steps[1].tapTargetId).toBe('tab.more')
    expect(scenariosById.settings.steps[2].tapTargetId).toBe('more.settings-item')
    expect(scenariosById.read.steps[0].tapTargetId).toBe('tab.read')
    expect(scenariosById.study.steps[0].tapTargetId).toBe('tab.study')
  })

  test('action-first tours start with a plain intro card', () => {
    const actionFirstIds = [
      'search',
      'player-description',
      'player-speed',
      'player-sound',
      'history',
      'offline',
      'settings',
    ] as const

    actionFirstIds.forEach(id => {
      const intro = scenariosById[id].steps[0]

      expect(intro.targetId).toBeUndefined()
      expect(intro.tapTargetId).toBeUndefined()
      expect(intro.tapActionId).toBeUndefined()
      expect(intro.interactive).toBeUndefined()
      expect(intro.route).toBeUndefined()
    })
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

  test('player-intro makes the edge zones a highlighted area step', () => {
    const intro = scenariosById['player-intro']

    expect(intro.steps[0].targetId).toBeUndefined()
    expect(intro.steps[0].areaTargetIds).toEqual([
      'player-fullscreen.edge-back',
      'player-fullscreen.edge-forward',
    ])
  })

  test('menu-driven player scenarios open the player menu first', () => {
    const menuTargetId = 'player-fullscreen.menu'

    expect(scenariosById['player-description'].steps[1].targetId).toBe(menuTargetId)
    expect(scenariosById['player-speed'].steps[1].targetId).toBe(menuTargetId)
    expect(scenariosById['player-sound'].steps[1].targetId).toBe(menuTargetId)
  })

  test('player-description performs the menu and details actions itself', () => {
    const description = scenariosById['player-description']

    expect(description.steps).toHaveLength(4)
    expect(description.steps[0].title).toBe('Подробнее и таймкоды')
    expect(description.steps[1].tapTargetId).toBe('player-fullscreen.menu')
    expect(description.steps[1].tapActionId).toBe('open-player-menu')
    expect(description.steps[2].targetId).toBe('player-fullscreen.menu-details')
    expect(description.steps[2].tapTargetId).toBe('player-fullscreen.menu-details')
    expect(description.steps[2].tapActionId).toBe('show-player-details')
    expect(description.steps[3].targetId).toBe('player-fullscreen.details')
    expect(description.steps[3].tapActionId).toBeUndefined()
  })

  test('player-speed performs the menu and speed-menu actions itself', () => {
    const speed = scenariosById['player-speed']

    expect(speed.steps).toHaveLength(4)
    expect(speed.steps[0].title).toBe('Скорость прослушивания')
    expect(speed.steps[1].tapActionId).toBe('open-player-menu')
    expect(speed.steps[2].targetId).toBe('player-fullscreen.menu-speed')
    expect(speed.steps[2].tapTargetId).toBe('player-fullscreen.menu-speed')
    expect(speed.steps[2].tapActionId).toBe('open-player-speed-menu')
    expect(speed.steps[3].targetId).toBe('player-fullscreen.speed-menu')
    expect(speed.steps[3].tapActionId).toBeUndefined()
  })

  test('player-sound performs the menu and sound-settings actions itself', () => {
    const sound = scenariosById['player-sound']

    expect(sound.steps).toHaveLength(4)
    expect(sound.steps[0].title).toBe('Настройка звука')
    expect(sound.steps[1].tapActionId).toBe('open-player-menu')
    expect(sound.steps[2].targetId).toBe('player-fullscreen.menu-sound')
    expect(sound.steps[2].tapActionId).toBe('open-player-sound-settings')
    expect(sound.steps[3].targetId).toBe('player-fullscreen.sound-sheet')
    expect(sound.steps[3].tapActionId).toBeUndefined()
  })

  test('search scenario opens the search, types the query and presses the first sermon', () => {
    const search = scenariosById.search

    expect(search.screens).toEqual(['/listen'])
    expect(search.steps).toHaveLength(7)
    expect(search.steps[0].title).toBe('Результаты поиска')
    expect(search.steps[1].tapTargetId).toBe('listen.search-toggle')
    expect(search.steps[1].tapActionId).toBe('open-listen-search')
    expect(search.steps[2].tapActionId).toBe('type-search-query')
    expect(search.steps[2].waitFor).toBeUndefined()
    expect(search.steps[3].targetId).toBe('search-results.group-sermons')
    expect(search.steps[4].targetId).toBe('search-results.first-sermon')
    expect(search.steps[4].tapActionId).toBe('press-first-sermon')
    expect(search.steps[5].interactive).toBe(true)
    expect(search.steps[6].interactive).toBe(true)
  })

  test('playlist-menu walks the header menu and ends on the interactive sermon menu', () => {
    const playlistMenu = scenariosById['playlist-menu']

    expect(playlistMenu.title).toBe('Экран плейлиста')
    expect(playlistMenu.screens).toEqual(['/listen/playlist'])
    expect(playlistMenu.steps).toHaveLength(11)
    expect(playlistMenu.steps[0].targetId).toBe('playlist.playback')
    expect(playlistMenu.steps[1].targetId).toBe('playlist.menu')
    expect(playlistMenu.steps[1].tapTargetId).toBe('playlist.menu')
    expect(playlistMenu.steps[1].tapActionId).toBe('open-playlist-menu')
    // Steps 2..9 are the header menu items; step 10 is the pass-through card
    // anchored to the first sermon row.
    expect(playlistMenu.steps.slice(2, 10).map(step => step.targetId)).toEqual([
      'playlist.menu-share',
      'playlist.menu-add-all',
      'playlist.menu-publish',
      'playlist.menu-offline-add',
      'playlist.menu-offline-remove',
      'playlist.menu-history-mark',
      'playlist.menu-clear',
      'playlist.menu-delete',
    ])
    const offlineRemoveIndex = playlistMenu.steps.findIndex(
      step => step.targetId === 'playlist.menu-offline-remove',
    )
    expect(playlistMenu.steps[offlineRemoveIndex].skipIfMissing).toBe(true)
    expect(playlistMenu.steps[offlineRemoveIndex - 1].targetId).toBe('playlist.menu-offline-add')
    // Every menu item may be absent (admin/local-only/feature-gated): the tour
    // drops its step instead of spotlighting a hidden row.
    expect(playlistMenu.steps.slice(2, 10).every(step => step.skipIfMissing === true)).toBe(true)
    expect(playlistMenu.steps[10].interactive).toBe(true)
    expect(playlistMenu.steps[10].targetId).toBe(FIRST_ROW_TARGET_ID)
    expect(playlistMenu.steps[10].areaTargetIds).toEqual([FIRST_ROW_TARGET_ID])
    expect(playlistMenu.steps[10].actionOnEnterId).toBe('close-playlist-menu')
  })

  test('playlist-add walks the row menu and ends on the playlist picker', () => {
    const playlistAdd = scenariosById['playlist-add']

    expect(playlistAdd.title).toBe('Добавление в плейлист')
    expect(playlistAdd.screens).toEqual(['/listen/playlist'])
    expect(playlistAdd.steps).toHaveLength(6)
    expect(playlistAdd.steps[0].targetId).toBeUndefined()
    expect(playlistAdd.steps[0].tapActionId).toBeUndefined()
    expect(playlistAdd.steps[0].tapTargetId).toBeUndefined()
    expect(playlistAdd.steps[0].interactive).toBeUndefined()
    expect(playlistAdd.steps[1].targetId).toBe(FIRST_ROW_TARGET_ID)
    expect(playlistAdd.steps[1].tapActionId).toBe('open-playlist-row-menu')
    expect(playlistAdd.steps[1].tapTargetId).toBe(FIRST_ROW_TARGET_ID)
    expect(playlistAdd.steps[2].targetId).toBe(ROW_MENU_ADD_TARGET_ID)
    expect(playlistAdd.steps[3].targetId).toBe(ROW_MENU_ADD_TARGET_ID)
    expect(playlistAdd.steps[3].tapTargetId).toBe(ROW_MENU_ADD_TARGET_ID)
    expect(playlistAdd.steps[3].tapActionId).toBe('press-row-menu-add')
    expect(playlistAdd.steps[4].targetId).toBe('playlist.add-modal-favorites')
    expect(playlistAdd.steps[4].actionOnEnterId).toBe('check-add-modal-favorites')
    expect(playlistAdd.steps[4].interactive).toBeUndefined()
    expect(playlistAdd.steps[4].presentOnTop).toBe(true)
    // The save step lives inside the AddToPlaylist modal: it is a spotlight step
    // (not pass-through) that re-presents the tour window above the app modal.
    expect(playlistAdd.steps[5].targetId).toBe('playlist.add-modal-save')
    expect(playlistAdd.steps[5].interactive).toBeUndefined()
    expect(playlistAdd.steps[5].presentOnTop).toBe(true)
  })

  test('playlists scenario no longer claims the single-playlist screen', () => {
    expect(scenariosById.playlists.screens).toEqual([
      '/listen',
      '/listen/my-playlists',
      '/listen/playlist-list',
    ])
  })
})

describe('resolveStepRoute', () => {
  test('returns the step route when the step declares one', () => {
    expect(resolveStepRoute(scenariosById.settings, 2)).toBe('/settings')
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

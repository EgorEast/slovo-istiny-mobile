import { resolveStepRoute } from './resolveStepRoute'
import { resolveTourStart } from './resolveTourStart'
import { scenarios, scenariosById } from './scenarios'
import { buildTourDeck, resolveDeckProgress } from './tourDeck'

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

  test('player scenario belongs to the listen screen picker', () => {
    expect(scenariosById.player.screens).toEqual(['/listen'])
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

  test('share scenario falls back globally and leads from «Ещё» into the QR code, copy button and link contents', () => {
    const share = scenariosById.share

    expect(share.screens).toEqual(['/more', '/share'])
    expect(share.globalFallback).toBe(true)
    expect(share.steps).toHaveLength(7)
    expect(share.steps[0].targetId).toBeUndefined()
    expect(share.steps[0].tapTargetId).toBeUndefined()
    // Pure-navigation return entry: no tap target, only a route.
    expect(share.steps[1].route).toBe('/more')
    expect(share.steps[1].tapTargetId).toBeUndefined()
    // The «Ещё» tab card: the return above lands here first from a nested screen.
    expect(share.steps[2].route).toBe('/more')
    expect(share.steps[2].tapTargetId).toBe('tab.more')
    expect(share.steps[2].targetId).toBe('tab.more')
    expect(share.steps[3].route).toBe('/share')
    expect(share.steps[3].tapTargetId).toBe('more.share-item')
    expect(share.steps[3].targetId).toBeUndefined()
    expect(share.steps[4].route).toBe('/share')
    expect(share.steps[4].targetId).toBe('share.qr')
    expect(share.steps[5].targetId).toBe('share.copy')
  })

  test('share folds its tab card and share-item lead-up into entry transitions', () => {
    const share = scenariosById.share
    const deck = buildTourDeck(share.steps)

    expect(deck).toHaveLength(5)
    expect(deck.map(entry => entry.cardIndex)).toEqual([0, 2, 4, 5, 6])
    expect(deck[1].entryStepIndexes).toEqual([1])
    expect(deck[2].entryStepIndexes).toEqual([3])
    expect(deck.filter(entry => entry.entryStepIndexes.length > 0)).toHaveLength(2)
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

  test('settings tour follows the visual order of the settings rows', () => {
    const settingsTargets = scenariosById.settings.steps.slice(2).map(step => step.targetId)

    expect(settingsTargets).toEqual([
      'settings.theme',
      'settings.haptics',
      'settings.tours',
      'settings.backup',
      'settings.server',
    ])
  })

  test('backup scenario falls back globally and opens the path into the backup section', () => {
    const backup = scenariosById.backup

    expect(backup.screens).toEqual(['/more', '/settings'])
    expect(backup.globalFallback).toBe(true)
    expect(backup.steps).toHaveLength(9)
    expect(backup.steps[0].route).toBe('/listen')
    expect(backup.steps[0].targetId).toBeUndefined()
    // Pure-navigation return entry: no tap target, only a route.
    expect(backup.steps[1].route).toBe('/more')
    expect(backup.steps[1].tapTargetId).toBeUndefined()
    // The «Ещё» tab card: the return above lands here first from a nested screen.
    expect(backup.steps[2].route).toBe('/more')
    expect(backup.steps[2].tapTargetId).toBe('tab.more')
    expect(backup.steps[2].targetId).toBe('tab.more')
    expect(backup.steps[3].route).toBe('/more')
    expect(backup.steps[3].tapTargetId).toBe('more.settings-item')
    expect(backup.steps[3].targetId).toBe('more.settings-item')
    expect(backup.steps[4].route).toBe('/settings')
    expect(backup.steps[4].tapTargetId).toBe('more.settings-item')
    expect(backup.steps[4].targetId).toBe('settings.backup')
  })

  test('backup folds the More tab return into the tab card as an entry transition', () => {
    const backup = scenariosById.backup
    const deck = buildTourDeck(backup.steps)

    expect(deck).toHaveLength(8)
    expect(deck.map(entry => entry.cardIndex)).toEqual([0, 2, 3, 4, 5, 6, 7, 8])
    expect(deck[1].entryStepIndexes).toEqual([1])
    expect(deck.filter(entry => entry.entryStepIndexes.length > 0)).toHaveLength(1)
  })

  test('backup scenario walks the section, folder, export, import and autosync', () => {
    const backup = scenariosById.backup

    expect(backup.steps[5].targetId).toBe('settings.backup-folder')
    expect(backup.steps[5].skipIfMissing).toBe(true)
    expect(backup.steps[6].targetId).toBe('settings.backup-export')
    expect(backup.steps[7].targetId).toBe('settings.backup-import')
    expect(backup.steps[8].targetId).toBe('settings.backup-autosync')
    expect(backup.steps[8].skipIfMissing).toBe(true)
  })

  test('offline caching-switch waits for the list to load before the spotlight lands', () => {
    const switchStep = scenariosById.offline.steps[2]

    expect(switchStep.targetId).toBe('offline.caching-switch')
    expect(switchStep.waitFor).toBe('offlineLoaded')
  })

  test('entry-point steps tell the user to tap the item to open the section', () => {
    expect(scenariosById.offline.steps[1].text).toBe(
      'Чтобы открыть раздел офлайн-кэша, тапните по этому пункту.',
    )
    expect(scenariosById.history.steps[1].text).toBe(
      'Чтобы открыть историю прослушивания, тапните по этому пункту.',
    )
    expect(scenariosById.settings.steps[1].text).toBe(
      'Чтобы открыть настройки, тапните по этому пункту.',
    )
  })

  test('every scenario starts with a card and action steps directly follow one', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    scenarios.forEach(scenario => {
      // No leading action step: the tour always starts on a card.
      expect(scenario.steps[0].tapActionId).toBeUndefined()

      // Every deck entry has a card, and the build never drops a leading action.
      const deck = buildTourDeck(scenario.steps)
      expect(deck.length).toBeGreaterThan(0)
      deck.forEach(entry => {
        expect(scenario.steps[entry.cardIndex].tapActionId).toBeUndefined()
      })
    })

    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
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

  test('search scenario leads from «Ещё» into the search results', () => {
    const search = scenariosById.search

    expect(search.screens).toBeUndefined()
    expect(search.steps).toHaveLength(9)
    expect(search.steps[0].targetId).toBeUndefined()
    // Pure-navigation return entry: no tap target, only a route.
    expect(search.steps[1].route).toBe('/listen')
    expect(search.steps[1].tapTargetId).toBeUndefined()
    // The «Слушать» tab card: the return above lands here first from a nested screen.
    expect(search.steps[2].route).toBe('/listen')
    expect(search.steps[2].tapTargetId).toBe('tab.listen')
    expect(search.steps[2].targetId).toBe('tab.listen')
    expect(search.steps[3].tapTargetId).toBe('listen.search-toggle')
    expect(search.steps[3].tapActionId).toBe('open-listen-search')
    expect(search.steps[4].tapActionId).toBe('type-search-query')
    expect(search.steps[4].waitFor).toBeUndefined()
    expect(search.steps[5].targetId).toBe('search-results.group-sermons')
    expect(search.steps[6].targetId).toBe('search-results.first-sermon')
    expect(search.steps[6].tapActionId).toBe('press-first-sermon')
    // The picker card spotlights above the SermonPlaylistPicker modal (presentOnTop);
    // the sermon-menu card stays pass-through (its dropdown is not a Modal).
    expect(search.steps[7].presentOnTop).toBe(true)
    expect(search.steps[7].cardPosition).toBe('bottom')
    expect(search.steps[7].interactive).toBeUndefined()
    expect(search.steps[8].interactive).toBe(true)
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

  test('playlist-offline walks the playlist cache menus and ends on the offline section', () => {
    const playlistOffline = scenariosById['playlist-offline']

    expect(playlistOffline.title).toBe('Прослушивание без интернета')
    expect(playlistOffline.screens).toEqual(['/listen/playlist'])
    expect(playlistOffline.steps).toHaveLength(8)
    expect(playlistOffline.steps[0].targetId).toBeUndefined()
    expect(playlistOffline.steps[0].tapActionId).toBeUndefined()
    expect(playlistOffline.steps[1].tapTargetId).toBe('playlist.menu')
    expect(playlistOffline.steps[1].tapActionId).toBe('open-playlist-menu')
    expect(playlistOffline.steps[2].targetId).toBe('playlist.menu-offline-add')
    expect(playlistOffline.steps[3].targetId).toBe('playlist.menu-offline-remove')
    // The row-menu exit closes the header menu opened at step 2, then blinks and
    // opens the row menu itself.
    expect(playlistOffline.steps[4].actionOnEnterId).toBe('close-playlist-menu')
    expect(playlistOffline.steps[4].tapTargetId).toBe(FIRST_ROW_TARGET_ID)
    expect(playlistOffline.steps[4].tapActionId).toBe('open-playlist-row-menu')
    // The row cache item is a toggle: one card covers both «Добавить в офлайн» and
    // «Удалить из офлайна» — there is no separate removal card.
    expect(playlistOffline.steps[5].targetId).toBe('playlist.row-menu-offline-add')
    expect(playlistOffline.steps[5].skipIfMissing).toBe(true)
    expect(playlistOffline.steps[5].text).toContain('Удалить из офлайна')
    // The tour stays on the playlist screen (its tab bar is visible) and only blinks
    // the «Ещё» tab before navigating: an entry transition, no /listen return.
    expect(playlistOffline.steps[6].route).toBe('/more')
    expect(playlistOffline.steps[6].tapTargetId).toBe('tab.more')
    expect(playlistOffline.steps[6].targetId).toBeUndefined()
    expect(playlistOffline.steps[7].targetId).toBe('more.offline-item')
  })

  test('playlist-offline folds its exits and entry into five cards', () => {
    const deck = buildTourDeck(scenariosById['playlist-offline'].steps)

    expect(deck).toHaveLength(5)
    expect(deck.map(entry => entry.cardIndex)).toEqual([0, 2, 3, 5, 7])
    expect(deck[0].exitStepIndexes).toEqual([1])
    expect(deck[2].exitStepIndexes).toEqual([4])
    expect(deck[4].entryStepIndexes).toEqual([6])
  })

  test('the playlist screen offers three local tours', () => {
    const localIds = scenarios
      .filter(scenario => scenario.screens?.includes('/listen/playlist') ?? false)
      .map(scenario => scenario.id)

    expect(localIds).toEqual(['playlist-menu', 'playlist-add', 'playlist-offline'])
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

describe('share scenario resume', () => {
  const deck = buildTourDeck(scenariosById.share.steps)

  test('plays the full lead-up from a foreign screen', () => {
    expect(resolveTourStart(scenariosById.share, deck, '/listen')).toEqual({
      deckIndex: 0,
      skippedDeckIndexes: [],
    })
  })

  test('resumes on the tab card from «Ещё» (the return entry skips itself)', () => {
    expect(resolveTourStart(scenariosById.share, deck, '/more')).toEqual({
      deckIndex: 1,
      skippedDeckIndexes: [0],
    })
  })

  test('skips the intro and starts on the QR card from «Поделиться приложением»', () => {
    expect(resolveTourStart(scenariosById.share, deck, '/share')).toEqual({
      deckIndex: 2,
      skippedDeckIndexes: [0, 1],
    })
  })

  test('counts only the remaining cards from the QR card', () => {
    const fromShare = resolveDeckProgress(deck, [0, 1], 2)

    expect(fromShare.displayIndex).toBe(0)
    expect(fromShare.displayTotal).toBe(3)
  })
})

describe('search scenario resume', () => {
  const deck = buildTourDeck(scenariosById.search.steps)

  test('resumes on the tab card from «Слушать» (the return entry skips itself)', () => {
    expect(resolveTourStart(scenariosById.search, deck, '/listen')).toEqual({
      deckIndex: 1,
      skippedDeckIndexes: [0],
    })
  })

  test('plays the full lead-up from «Ещё», where no card routes yet', () => {
    expect(resolveTourStart(scenariosById.search, deck, '/more')).toEqual({
      deckIndex: 0,
      skippedDeckIndexes: [],
    })
  })

  test('counts every card when the lead-up is not skipped', () => {
    const progress = resolveDeckProgress(deck, [], 0)

    expect(progress.displayIndex).toBe(0)
    expect(progress.displayTotal).toBe(5)
  })
})

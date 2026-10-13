import { type Ionicons } from '@expo/vector-icons'
import { type Href } from 'expo-router'
import { historyScenario } from './scenarioData/history'
import { listenScenario } from './scenarioData/listen'
import { offlineScenario } from './scenarioData/offline'
import { playerScenario } from './scenarioData/player'
import { playerDescriptionScenario } from './scenarioData/player-description'
import { playerIntroScenario } from './scenarioData/player-intro'
import { playerSoundScenario } from './scenarioData/player-sound'
import { playerSpeedScenario } from './scenarioData/player-speed'
import { playlistMenuScenario } from './scenarioData/playlist-menu'
import { playlistsScenario } from './scenarioData/playlists'
import { readScenario } from './scenarioData/read'
import { searchScenario } from './scenarioData/search'
import { settingsScenario } from './scenarioData/settings'
import { shareScenario } from './scenarioData/share'
import { studyScenario } from './scenarioData/study'
import { welcomeScenario } from './scenarioData/welcome'
import { whatsNewScenario } from './scenarioData/whatsNew'

export interface OnboardingScenario {
  description: string
  featureFlag?: 'read' | 'study'
  icon: keyof typeof Ionicons.glyphMap
  id: OnboardingScenarioId
  scope?: ScenarioScope
  // Exact routes the scenario belongs to; `undefined` = global (offered everywhere).
  screens?: Href[]
  sinceVersion?: string
  steps: OnboardingStep[]
  title: string
}

// Which picker offers the scenario. `default` scenarios belong to the screen
// pickers (the header «?»); `player` scenarios belong only to the fullscreen picker.
export type ScenarioScope = 'default' | 'player'

export const resolveScenarioScope = (scenario: OnboardingScenario): ScenarioScope =>
  scenario.scope ?? 'default'

export type OnboardingScenarioId =
  | 'history'
  | 'listen'
  | 'offline'
  | 'player-description'
  | 'player-intro'
  | 'player-sound'
  | 'player-speed'
  | 'player'
  | 'playlist-menu'
  | 'playlists'
  | 'read'
  | 'search'
  | 'settings'
  | 'share'
  | 'study'
  | 'welcome'
  | 'whatsNew'

export interface OnboardingStep {
  // Highlighted target rects (no dim) — see ui/TourWaitLayer.tsx.
  areaTargetIds?: string[]
  // Pass-through card over the live UI, no spotlight modal.
  interactive?: boolean
  route?: Href
  // Registered action the tour performs itself and then auto-advances (see
  // lib/tourActions.ts); an action step is demonstrative and never navigates.
  tapActionId?: string
  tapTargetId?: string
  targetId?: string
  text: string
  title: string
  waitFor?: 'paused' | 'searchActive' | 'sermonSelected'
}

export const scenarios: OnboardingScenario[] = [
  listenScenario,
  playerScenario,
  playerIntroScenario,
  playerDescriptionScenario,
  playerSpeedScenario,
  playerSoundScenario,
  playlistsScenario,
  searchScenario,
  playlistMenuScenario,
  historyScenario,
  offlineScenario,
  settingsScenario,
  readScenario,
  studyScenario,
  shareScenario,
  welcomeScenario,
  whatsNewScenario,
]

export const scenariosById: Record<OnboardingScenarioId, OnboardingScenario> = {
  history: historyScenario,
  listen: listenScenario,
  offline: offlineScenario,
  player: playerScenario,
  'player-description': playerDescriptionScenario,
  'player-intro': playerIntroScenario,
  'player-sound': playerSoundScenario,
  'player-speed': playerSpeedScenario,
  'playlist-menu': playlistMenuScenario,
  playlists: playlistsScenario,
  read: readScenario,
  search: searchScenario,
  settings: settingsScenario,
  share: shareScenario,
  study: studyScenario,
  welcome: welcomeScenario,
  whatsNew: whatsNewScenario,
}

// A step without its own `route` stays on the screen of the nearest preceding
// step that has one — the tour keeps the user on the screen the step belongs to.
// Returns `undefined` when no step up to `stepIndex` declares a route.
export const resolveStepRoute = (
  scenario: OnboardingScenario,
  stepIndex: number,
): Href | undefined => {
  for (let index = stepIndex; index >= 0; index -= 1) {
    const route = scenario.steps[index].route
    if (route !== undefined) return route
  }

  return undefined
}

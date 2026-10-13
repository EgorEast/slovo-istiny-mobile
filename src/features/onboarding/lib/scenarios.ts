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
  // Exact routes the scenario belongs to; `undefined` means it is global and
  // offered on every screen. The picker splits its list by exact pathname match.
  screens?: Href[]
  sinceVersion?: string
  steps: OnboardingStep[]
  title: string
}

// Which picker offers the scenario. `default` scenarios belong to the screen
// pickers (the header «?»); `player` scenarios belong only to the fullscreen
// player picker, so they never leak into the screen pickers.
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
  | 'playlists'
  | 'read'
  | 'search'
  | 'settings'
  | 'share'
  | 'study'
  | 'welcome'
  | 'whatsNew'

export interface OnboardingStep {
  route?: Href
  tapTargetId?: string
  targetId?: string
  text: string
  title: string
  waitFor?: 'paused' | 'sermonSelected'
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

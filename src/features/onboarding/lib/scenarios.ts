import { type Ionicons } from '@expo/vector-icons'
import { type Href } from 'expo-router'
import { backupScenario } from './scenarioData/backup'
import { historyScenario } from './scenarioData/history'
import { listenScenario } from './scenarioData/listen'
import { offlineScenario } from './scenarioData/offline'
import { playerScenario } from './scenarioData/player'
import { playerDescriptionScenario } from './scenarioData/player-description'
import { playerIntroScenario } from './scenarioData/player-intro'
import { playerSoundScenario } from './scenarioData/player-sound'
import { playerSpeedScenario } from './scenarioData/player-speed'
import { playlistAddScenario } from './scenarioData/playlist-add'
import { playlistMenuScenario } from './scenarioData/playlist-menu'
import { playlistOfflineScenario } from './scenarioData/playlist-offline'
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

// Which picker offers the scenario: `default` = screen pickers, `player` = fullscreen only.
export type ScenarioScope = 'default' | 'player'

export const resolveScenarioScope = (scenario: OnboardingScenario): ScenarioScope =>
  scenario.scope ?? 'default'

export type OnboardingScenarioId =
  | 'backup'
  | 'history'
  | 'listen'
  | 'offline'
  | 'player-description'
  | 'player-intro'
  | 'player-sound'
  | 'player-speed'
  | 'player'
  | 'playlist-add'
  | 'playlist-menu'
  | 'playlist-offline'
  | 'playlists'
  | 'read'
  | 'search'
  | 'settings'
  | 'share'
  | 'study'
  | 'welcome'
  | 'whatsNew'

export interface OnboardingStep {
  // Registered action performed once on activation, no blink/auto-advance (lib/tourActions.ts).
  actionOnEnterId?: string
  // Highlighted target rects (background dimmed, zones stay bright) — see ui/TourWaitLayer.tsx.
  areaTargetIds?: string[]
  // Pass-through card over the live UI, no spotlight modal.
  interactive?: boolean
  // Re-present the tour window (fresh native Modal keyed by step) above app modals.
  presentOnTop?: boolean
  route?: Href
  // Target may be absent (admin/local/flag row): skip the step when its rect never registers.
  skipIfMissing?: boolean
  // Registered action the tour performs itself, then auto-advances (lib/tourActions.ts).
  tapActionId?: string
  tapTargetId?: string
  targetId?: string
  text: string
  title: string
  waitFor?: 'offlineLoaded' | 'paused' | 'sermonSelected'
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
  playlistAddScenario,
  playlistOfflineScenario,
  historyScenario,
  offlineScenario,
  settingsScenario,
  backupScenario,
  readScenario,
  studyScenario,
  shareScenario,
  welcomeScenario,
  whatsNewScenario,
]

export const scenariosById: Record<OnboardingScenarioId, OnboardingScenario> = {
  backup: backupScenario,
  history: historyScenario,
  listen: listenScenario,
  offline: offlineScenario,
  player: playerScenario,
  'player-description': playerDescriptionScenario,
  'player-intro': playerIntroScenario,
  'player-sound': playerSoundScenario,
  'player-speed': playerSpeedScenario,
  'playlist-add': playlistAddScenario,
  'playlist-menu': playlistMenuScenario,
  'playlist-offline': playlistOfflineScenario,
  playlists: playlistsScenario,
  read: readScenario,
  search: searchScenario,
  settings: settingsScenario,
  share: shareScenario,
  study: studyScenario,
  welcome: welcomeScenario,
  whatsNew: whatsNewScenario,
}

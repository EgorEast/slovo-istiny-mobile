import { type Ionicons } from '@expo/vector-icons'
import { type Href } from 'expo-router'
import { historyScenario } from './scenarioData/history'
import { listenScenario } from './scenarioData/listen'
import { offlineScenario } from './scenarioData/offline'
import { playlistsScenario } from './scenarioData/playlists'
import { readScenario } from './scenarioData/read'
import { settingsScenario } from './scenarioData/settings'
import { studyScenario } from './scenarioData/study'
import { welcomeScenario } from './scenarioData/welcome'
import { whatsNewScenario } from './scenarioData/whatsNew'

export interface OnboardingScenario {
  description: string
  featureFlag?: 'read' | 'study'
  icon: keyof typeof Ionicons.glyphMap
  id: OnboardingScenarioId
  sinceVersion?: string
  steps: OnboardingStep[]
  title: string
}

export type OnboardingScenarioId =
  | 'history'
  | 'listen'
  | 'offline'
  | 'playlists'
  | 'read'
  | 'settings'
  | 'study'
  | 'welcome'
  | 'whatsNew'

export interface OnboardingStep {
  route?: Href
  targetId?: string
  text: string
  title: string
}

export const scenarios: OnboardingScenario[] = [
  welcomeScenario,
  whatsNewScenario,
  listenScenario,
  playlistsScenario,
  historyScenario,
  offlineScenario,
  settingsScenario,
  readScenario,
  studyScenario,
]

export const scenariosById: Record<OnboardingScenarioId, OnboardingScenario> = {
  history: historyScenario,
  listen: listenScenario,
  offline: offlineScenario,
  playlists: playlistsScenario,
  read: readScenario,
  settings: settingsScenario,
  study: studyScenario,
  welcome: welcomeScenario,
  whatsNew: whatsNewScenario,
}

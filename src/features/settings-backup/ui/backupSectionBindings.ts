import { type ReactElement } from 'react'

/**
 * Ключи внутренних контролов секции резервного копирования, которые владелец
 * (экран) может обернуть в свои онбординг-цели. Фича об онбординге не знает —
 * получает только generic-обёртку (dependency inversion).
 */
export type BackupControlKey = 'autosync' | 'export' | 'folder' | 'import'

/** Опциональные DI-пропсы секции: обёртка контролов и доступ к её управлению. */
export interface BackupSectionBindings {
  /** Отдаёт владельцу управление секцией; `null` — снятие привязки на анмаунте. */
  bindControls?: (controls: BackupSectionControls | null) => void
  /** Оборачивает внутренний контрол (например, в онбординг-цель) по его ключу. */
  renderControlWrapper?: (control: ReactElement, controlKey: BackupControlKey) => ReactElement
}

/**
 * Управление секцией, которое она отдаёт владельцу, пока смонтирована: `expand`
 * разворачивает свёрнутую группу, чтобы тур мог подсветить её внутренние контролы.
 */
export interface BackupSectionControls {
  expand: () => void
}

import { type ReactElement } from 'react'

/**
 * Опциональные DI-пропсы модалки добавления в плейлист (паттерн bind из
 * `entities/track-list`): владелец (page) оборачивает строки/кнопку в свои
 * онбординг-цели и получает управление выбором, сама фича об онбординге не знает.
 */
export interface AddToPlaylistBindings {
  /** Отдаёт владельцу управление выбором; `null` — снятие привязки. */
  bindControls?: (controls: AddToPlaylistControls | null) => void
  /** Оборачивает строку плейлиста (например, в онбординг-цель). */
  renderRowWrapper?: (row: ReactElement, playlistId: string) => ReactElement
  /** Оборачивает кнопку «Сохранить» (например, в онбординг-цель). */
  renderSaveWrapper?: (save: ReactElement) => ReactElement
}

/**
 * Управление, которое модалка «Добавить в плейлист» отдаёт владельцу, пока
 * смонтирована, чтобы тур мог вести живой диалог (поставить галочку плейлиста),
 * не зная об онбординге. `null` снимает привязку на анмаунте.
 */
export interface AddToPlaylistControls {
  setPlaylistChecked: (playlistId: string, checked: boolean) => void
}

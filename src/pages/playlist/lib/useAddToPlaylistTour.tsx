import { type ReactElement, useCallback, useRef } from 'react'
import { type AddToPlaylistControls } from 'features/add-to-playlist'
import { OnboardingTarget, useTourActionRegistrar } from 'features/onboarding'
import { FAVORITES_PLAYLIST } from 'entities/playlist'

const FAVORITES_ROW_TARGET_ID = 'playlist.add-modal-favorites'
const CREATE_TARGET_ID = 'playlist.add-modal-create'
const SAVE_TARGET_ID = 'playlist.add-modal-save'
const CHECK_FAVORITES_ACTION_ID = 'check-add-modal-favorites'

/**
 * Связывает модалку «Добавить в плейлист» с онбордингом: строки, кнопка
 * «Создать плейлист» и кнопка «Сохранить» становятся целями спотлайта, а
 * действие тура `check-add-modal-favorites` ставит галочку «Избранных».
 * Управление выбором модалка отдаёт через `bindControls` (dependency inversion —
 * фича не импортирует онбординг), page хранит его и выполняет действие сам.
 * @returns DI-пропсы модалки и биндер её управления выбором.
 */
export const useAddToPlaylistTour = () => {
  const controlsRef = useRef<AddToPlaylistControls | null>(null)

  const bindControls = useCallback((controls: AddToPlaylistControls | null) => {
    controlsRef.current = controls
  }, [])

  const checkFavorites = useCallback(() => {
    controlsRef.current?.setPlaylistChecked(FAVORITES_PLAYLIST.id, true)
  }, [])

  useTourActionRegistrar(CHECK_FAVORITES_ACTION_ID, checkFavorites)

  const renderRowWrapper = useCallback(
    (row: ReactElement, playlistId: string) =>
      playlistId === FAVORITES_PLAYLIST.id ? (
        <OnboardingTarget id={FAVORITES_ROW_TARGET_ID}>{row}</OnboardingTarget>
      ) : (
        row
      ),
    [],
  )

  const renderSaveWrapper = useCallback(
    (save: ReactElement) => <OnboardingTarget id={SAVE_TARGET_ID}>{save}</OnboardingTarget>,
    [],
  )

  const renderCreateWrapper = useCallback(
    (create: ReactElement) => <OnboardingTarget id={CREATE_TARGET_ID}>{create}</OnboardingTarget>,
    [],
  )

  return { bindControls, renderCreateWrapper, renderRowWrapper, renderSaveWrapper }
}

import { useRouter } from 'expo-router'
import { useCreateLocalPlaylist } from 'entities/playlist'

/**
 * Состояние формы создания локального плейлиста на отдельном экране.
 *
 * Логика создания живёт в `entities/playlist` (`useCreateLocalPlaylist`); здесь
 * остаётся только поведение экрана: после успешного создания форма закрывается,
 * а пользователь уводится на экран созданного плейлиста.
 * @param onClose - Закрыть форму после успешного создания.
 * @returns Значение и сеттер названия, доступность/признак отправки и обработчик.
 */
export const useCreateLocalPlaylistForm = (onClose: () => void) => {
  const router = useRouter()

  return useCreateLocalPlaylist(created => {
    onClose()
    router.push({ params: { playlist: created.id }, pathname: '/listen/playlist' })
  })
}

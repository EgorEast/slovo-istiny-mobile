// Кросс-импорт по конвенции FSD `@x`: entities/playlist закрывает плеер при
// удалении текущей проповеди из её плейлиста (нотификейшн-бар + миниплеер).
export { currentAudioAtom, currentPlaylistAtom } from '../model'
export { resetPlaybackAction } from '../resetPlayback'

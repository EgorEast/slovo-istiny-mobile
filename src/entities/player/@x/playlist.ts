// Кросс-импорт по конвенции FSD `@x`: entities/playlist закрывает плеер при
// удалении текущей проповеди из её плейлиста (нотификейшн-бар + миниплеер) и
// синхронизирует очередь (боттомшит) при удалении из играющего плейлиста.
export { currentAudioAtom, currentPlaylistAtom, setCurrentPlaylistAction } from '../model'
export { resetPlaybackAction } from '../resetPlayback'

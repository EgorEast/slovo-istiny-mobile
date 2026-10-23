// Границы ввода, которые сервер проверяет по спецификации: источник истины —
// сгенерированные zod-константы (`shared/api/generated/model/*`). Формы админки
// зеркалят их клиентски, чтобы не получать `400` на заведомо неверном вводе.
import {
  featureFlagsControllerCreateBodyKeyMax,
  featureFlagsControllerCreateBodyTitleMax,
} from '../../api/generated/model/feature-flags'
import {
  invidiousInstancesControllerReplaceBodyUrlsItemMax,
  invidiousInstancesControllerReplaceBodyUrlsMax,
} from '../../api/generated/model/invidious'
import {
  playlistControllerCreateBodyArtworkMax,
  playlistControllerCreateBodyDescriptionMax,
  playlistControllerCreateBodySectionsIdsMax,
  playlistControllerCreateBodySermonsIdsMax,
  playlistControllerCreateBodyTitleMax,
} from '../../api/generated/model/playlists'
import {
  sectionControllerCreateBodyDescriptionMax,
  sectionControllerCreateBodyItemsRowsMax,
  sectionControllerCreateBodyTitleMax,
  sectionControllerUpdateBodyPlaylistsIdsMax,
} from '../../api/generated/model/sections'
import {
  sermonControllerCreateBodyArtistMax,
  sermonControllerCreateBodyArtworkMax,
  sermonControllerCreateBodyAudioUrlMax,
  sermonControllerCreateBodyAudioUrlRegExp,
  sermonControllerCreateBodyBookMax,
  sermonControllerCreateBodyDescriptionMax,
  sermonControllerCreateBodyPlaylistsIdsMax,
  sermonControllerCreateBodyTextFileUrlMax,
  sermonControllerCreateBodyTitleMax,
  sermonControllerCreateBodyYoutubeUrlMax,
  sermonControllerFindAllQuerySearchMax,
} from '../../api/generated/model/sermons'
import {
  usersControllerChangePasswordBodyPasswordMax,
  usersControllerChangePasswordBodyPasswordMin,
  usersControllerCreateBodyEmailMax,
  usersControllerCreateBodyNameMax,
  usersControllerCreateBodyUsernameMax,
} from '../../api/generated/model/users'

export const INPUT_LIMITS = {
  featureFlag: {
    key: featureFlagsControllerCreateBodyKeyMax,
    title: featureFlagsControllerCreateBodyTitleMax,
  },
  invidious: {
    url: invidiousInstancesControllerReplaceBodyUrlsItemMax,
    urls: invidiousInstancesControllerReplaceBodyUrlsMax,
  },
  playlist: {
    artwork: playlistControllerCreateBodyArtworkMax,
    description: playlistControllerCreateBodyDescriptionMax,
    sections: playlistControllerCreateBodySectionsIdsMax,
    sermons: playlistControllerCreateBodySermonsIdsMax,
    title: playlistControllerCreateBodyTitleMax,
  },
  search: sermonControllerFindAllQuerySearchMax,
  section: {
    description: sectionControllerCreateBodyDescriptionMax,
    itemsRows: sectionControllerCreateBodyItemsRowsMax,
    playlists: sectionControllerUpdateBodyPlaylistsIdsMax,
    title: sectionControllerCreateBodyTitleMax,
  },
  sermon: {
    artist: sermonControllerCreateBodyArtistMax,
    artwork: sermonControllerCreateBodyArtworkMax,
    audioUrl: sermonControllerCreateBodyAudioUrlMax,
    book: sermonControllerCreateBodyBookMax,
    description: sermonControllerCreateBodyDescriptionMax,
    playlists: sermonControllerCreateBodyPlaylistsIdsMax,
    textFileUrl: sermonControllerCreateBodyTextFileUrlMax,
    title: sermonControllerCreateBodyTitleMax,
    youtubeUrl: sermonControllerCreateBodyYoutubeUrlMax,
  },
  user: {
    email: usersControllerCreateBodyEmailMax,
    name: usersControllerCreateBodyNameMax,
    passwordMax: usersControllerChangePasswordBodyPasswordMax,
    passwordMin: usersControllerChangePasswordBodyPasswordMin,
    username: usersControllerCreateBodyUsernameMax,
  },
} as const

// Ссылка на файл в хранилище (MinIO): `audioUrl` и `textFileUrl` в спецификации
// используют один и тот же паттерн.
export const FILE_URL_PATTERN = sermonControllerCreateBodyAudioUrlRegExp

# Добавление проповеди в плейлист («Добавить в плейлист»)

Действие в контекст-меню проповеди: открывает модалку мультивыбора локальных
плейлистов. Чекбоксы меняют только черновик, а принадлежность применяется по
кнопке «Сохранить»; «Отмена» и тап по фону правки отбрасывают.

**Файлы:**

- `src/entities/playlist/localPlaylistMembership.ts` — экшен `togglePlaylistSermon`
- `src/entities/playlist/localPlaylistStorage.ts` — приватный `persistMyPlaylists`
- `src/features/add-to-playlist/index.ts` — публичный API (`useAddToPlaylistModal`)
- `src/features/add-to-playlist/lib/useAddToPlaylistModal.tsx` — экранный хук: состояние + готовый элемент `modal`
- `src/features/add-to-playlist/lib/useMembershipDraft.ts` — черновик принадлежности (dirty-гейт и сохранение)
- `src/features/add-to-playlist/lib/useSortedPlaylists.ts` — начальная принадлежность + сортировка
- `src/features/add-to-playlist/ui/AddToPlaylistModal.tsx` — модалка
- `src/features/add-to-playlist/ui/AddToPlaylistFooter.tsx` — футер «Отмена»/«Сохранить»
- `src/features/add-to-playlist/ui/PlaylistMembershipList.tsx` — ограниченный по высоте список
- `src/features/add-to-playlist/ui/PlaylistMembershipRow.tsx` — строка: название + чекбокс

## Экшен сущности

`togglePlaylistSermon(ctx, playlistId, sermon, contained)` (`entities/playlist`) —
единственный мутирующий путь наполнения локального плейлиста. `sermon` — **полный
снапшот** проповеди (`SermonShape`), а не только id: при добавлении кладётся
санитизированный снапшот, при удалении — фильтрация по `sermon.id`. Вызывается
только при сохранении черновика (см. ниже), по одному разу на изменившийся плейлист.

1. Находит плейлист в `myPlaylistsAtom`; **неизвестный id — no-op** (возвращает
   текущий список).
2. **Идемпотентность:** если `contained` уже совпадает с фактическим состоянием —
   no-op (без записи и без коммита).
3. Строит новый список: `contained` — дописывает санитизированный снапшот
   (`toPersistedLocalSermon`: без `playlists`, `artwork ?? null`) в конец `sermons`,
   иначе — фильтрует по `sermon.id`. `sermonIds` пересчитываются как производное
   от `sermons`. «Избранные» обрабатываются тем же кодом, что и любой
   другой плейлист.
4. **Мгновенный коммит, затем запись:** чтение атома → вычисление
   `nextPlaylists` → `ctx.schedule`, коммитящий `myPlaylistsAtom`, идут без
   `await` между ними, поэтому два быстрых переключения не теряют изменение друг
   друга (lost update); `persistMyPlaylists(nextPlaylists)` (тот же путь, что у
   `reorderMyPlaylists`) выполняется уже после коммита. Отказ хранилища не
   пробрасывается: логируется
   (`console.error('[togglePlaylistSermon] failed to persist membership:', …)`),
   атом остаётся закоммиченным — та же политика деградации, что и при гидратации
   и reorder (см. [my-playlists.md](./my-playlists.md)).

## Модалка

`AddToPlaylistModal` — «глупый» компонент: `visible`/`onClose` держит
вызывающий экран, `sermon` — полная `SermonData` (для проверки принадлежности
используется `sermon.id`, для добавления сохраняется снапшот). Внутри:

- `useSortedPlaylists(sermonId)` подписан на `myPlaylistsAtom` и возвращает
  `{ isContained, playlist }[]`, отсортированный так: **сначала плейлисты,
  содержащие проповедь, затем остальные**. Внутри каждой группы сохраняется
  порядок атома, поэтому «Избранные» (запиннены первыми в `myPlaylistsAtom`,
  см. [my-playlists.md](./my-playlists.md)) остаются первыми **и в своей группе**
  независимо от принадлежности. Список — **все** плейлисты атома, включая
  пользовательские: созданные формой (`createLocalPlaylist`) плейлисты появляются в
  модалке автоматически (живая подписка), отдельного фильтра «только избранное» нет.
  Возвращаемый `isContained` — **снимок** атома: он задаёт начальное значение
  черновика и блокировку заполненных плейлистов, а не отражает ещё не сохранённые
  правки.
- `useMembershipDraft(sermon)` — **черновик** принадлежности: `values`
  (`Record<playlistId, boolean>`, инициализируется из `myPlaylistsAtom` по
  `sermon.id`, «Избранные» включены), `isDirty`, `toggle(playlistId)` и `save()`.
  `toggle` меняет только черновик (`myPlaylistsAtom` не трогается); `save`
  последовательно вызывает `togglePlaylistSermon(ctx, id, sermon, value)` **только
  для изменившихся** плейлистов (исход каждого вызова не разбирается — `void`).
- `PlaylistMembershipList` — `FlatList` с ограничением `maxHeight` (360), чтобы
  длинный набор плейлистов скроллился, а не рос за экран. Рендерит строки из
  **черновика** (`values`), а не из живого атома.
- `PlaylistMembershipRow` — `CheckboxField`: тап по строке вызывает только
  `toggle` черновика и **не** закрывает модалку. Если плейлист заполнен до
  `MAX_CUSTOM_PLAYLIST_SERMONS` (200) и проповеди в нём изначально нет,
  строка **отключена** (`disabled`) с подсказкой «Достигнут лимит — 200 проповедей»
  (тоста нет; это единственный видимый признак лимита, поэтому сохранение туда
  недостижимо). Содержащую проповедь строку отключать нельзя — её можно снять.
- `AddToPlaylistFooter` — две кнопки: **«Сохранить»** (primary; недоступна, пока
  черновик не изменён — гейт по `isDirty`; по нажатию `save()` применяет изменения
  и закрывает модалку) и **«Отмена»** (закрывает и отбрасывает черновик). Тап по
  фону равнозначен «Отмене» (проп `onClose`). Пустой набор плейлистов невозможен:
  `myPlaylistsAtom` всегда содержит хотя бы «Избранные».

`useAddToPlaylistModal` открывает модалку **следующим кадром**
(`requestAnimationFrame`): контекст-меню — тоже нативная `Modal`, и она
закрывается своим кадром. Без задержки оба нативных `Modal` монтировались бы в
одном коммите и на Android накладывались бы друг на друга; возвращаемый API хука
не меняется.

## Интеграция по поверхностям

Правило: поверхности — `pages`/`widgets` — импортируют фичу **через её баррель**
(`useAddToPlaylistModal`), но между собой **не** импортируют фичу: вложенные
компоненты получают готовый колбэк `onAddToPlaylist(sermon)` пропом. Одна модалка
монтируется **на поверхность** (не на строку), поэтому в списке рендерится один
`modal`, а не по одному на строку.

- **Экран плейлиста** (`pages/playlist`): `PlaylistScreen` владеет хуком; колбэк
  уходит в `usePlaylistActions` → `buildHistoryMenuActions`. Модалка — на уровне
  экрана.
- **Результаты поиска** (`features/sermon-search` + `pages/listen`):
  `ListenScreen` владеет хуком и передаёт `onAddToPlaylist` пропом через
  `SearchGroupedResults` → `SearchSermonGroup` → `SearchResultsRow` → `SermonSearchRow` →
  `buildHistoryMenuActions`. Кросс-фичевого импорта нет.
- **Полноэкранный плеер и шторка очереди** (`widgets/expandable-player`):
  `ExpandablePlayer` владеет хуком (одна модалка). Колбэк идёт в меню трека
  (`ContainerView` → `FullscreenContent` → `PlayerControlsSection` →
  `PlayerMenuAnchor` → `PlayerMenu` → `PlayerMenuItems`) и в шторку очереди
  (`FullscreenSheets` → `PlaylistBottomSheet` → … → `useSheetMenuActions` →
  `buildHistoryMenuActions`). В меню плеера `audio` передаётся явно
  (`PlayerMenu` получает `audio`), т.к. это не строка списка.
- **Офлайн** (`pages/offline`): `OfflineScreen` владеет хуком, `OfflineRow`
  строит `MenuItem`-массив c «Добавить в плейлист» и передаёт в `TracksListItem`.
- **История** (`pages/history`): `HistoryScreen` владеет хуком, `HistoryRow`
  передаёт колбэк в `buildHistoryMenuActions`.

Пункт меню — иконка `Ionicons 'add-circle'`, текст «Добавить в плейлист»;
добавляется **первым** в `buildHistoryMenuActions`, только когда колбэк задан
(иначе пункт отсутствует — обратная совместимость с существующими меню).

## Удаление из плейлиста (обратное действие)

На экране локального плейлиста (`pages/playlist`) контекст-меню строки получает
пункт **«Удалить из плейлиста»** (иконка MCI `playlist-remove`, сразу после
«Добавить в плейлист») — только для плейлистов, присутствующих в «Мои
плейлисты» (`myPlaylistsAtom` — «Избранные», созданные вручную и
импортированные, включая uuid-id; видимость даёт хук `useIsLocalPlaylist`). Тап не удаляет сразу: экран
открывает подтверждение (`RemoveSermonFromPlaylistDialog` поверх общего
`ConfirmDialog`), и только кнопка «Удалить» вызывает
`togglePlaylistSermon(ctx, playlist.id, sermon, false)`; «Отмена»/закрытие лишь
скрывают диалог. Список обновляется из `myPlaylistsAtom` — строка исчезает.
Пункт строится в `usePlaylistActions` (страничная логика), а **не** в
`buildHistoryMenuActions`, поэтому в других меню (история, поиск, шторка плеера,
офлайн) он не появляется. Полноэкранное меню плеера имеет отдельный пункт
«Удалить из текущего плейлиста» (без диалога) — см. [player.md](./player.md).

## Связанные документы

- [features/my-playlists.md](./my-playlists.md)
- [features/track-list.md](./track-list.md)
- [screens/listen.md](../screens/listen.md)
- [screens/playlist.md](../screens/playlist.md)
- [screens/history.md](../screens/history.md)
- [screens/offline.md](../screens/offline.md)

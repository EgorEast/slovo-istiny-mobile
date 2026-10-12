# Онбординг (обзор возможностей)

**Слой:** `features/onboarding`
**Статус:** готов

## Что это

Кнопка «?» в шапке пользовательских экранов открывает пошаговый обзор возможностей приложения — без видео и внешних инструкций, прямо на реальном интерфейсе. Поток: тап по «?» → оффер-диалог «Обзор приложения» («Посмотреть» / «Закрыть») → модалка выбора сценария «Что посмотреть?» → спотлайт-тур: экран затемняется, вокруг реального элемента UI «вырезается» дырка, рядом показывается карточка шага с заголовком, текстом, счётчиком и кнопками «Назад» / «Далее» / «Готово».

Пользовательская ценность — ненавязчиво объяснить, что где находится (поиск, продолжение прослушивания, плейлисты, офлайн, настройки, чтение, обучение), показывая настоящие элементы, а не скриншоты: если вёрстка изменится, тур останется корректным.

## Как работает (поток «?»)

1. **Кнопка «?»** — `HelpHeaderButton` (`ui/HelpHeaderButton.tsx`): `IconButton` с иконкой `help-circle-outline`, `accessibilityLabel` «Онбординг и помощь». Локальный `useState` ведёт поток по трём состояниям `idle → offer → picker`. Если настройка «Обзоры и подсказки» выключена (`toursDisabledAtom === true`, дефолт — подсказки включены) — кнопка рендерит `null` (шапка/меню остаются на месте), а автозапуск туров блокируется (см. «Автозапуск»).
2. **Оффер-диалог** — общий `ConfirmDialog` «Обзор приложения» («Хотите посмотреть, как пользоваться приложением?») с кнопками «Посмотреть» / «Закрыть». «Посмотреть» переводит в `picker`, «Закрыть» возвращает в `idle`.
3. **Выбор сценария** — `ScenarioPickerModal` (`ui/ScenarioPickerModal.tsx`, заголовок «Что посмотреть?») со списком доступных сценариев (иконка, название, описание). Список строит `useOnboardingScenarios` — он отфильтровывает `read`/`study` по фича-флагам `read`/`study` (см. [feature-flags.md](./feature-flags.md)), а также **авто-сценарии** (`sinceVersion`: `welcome`/`whatsNew`) — они запускаются только автозапуском и в пикере не показываются.
4. **Старт тура** — тап по сценарию закрывает модалку и сразу вызывает `startOnboardingTour(scenarioId)` (без отдельной навигации и задержки). Навигацию по шагам делает сам оверлей: у шага может быть `route`, и `OnboardingTourOverlay` следит за активным шагом — если `pathname` не совпадает с `step.route`, выполняется `router.push(step.route)`. Так многоэкранный тур переходит между экранами между шагами.
5. **Тур** — `OnboardingTourOverlay` (`ui/OnboardingTourOverlay.tsx`): `Modal` (`transparent`, `animationType='fade'`, `statusBarTranslucent`, `navigationBarTranslucent`) с двумя слоями — затемнение `TourDim` и карточка `TourTooltip`. Карточка позиционируется с учётом системной навигационной панели: высота окна (`useWindowDimensions`) на Android edge-to-edge включает зону под системным навбаром, поэтому нижняя граница позиции отсчитывается от `windowHeight − insets.bottom` (безопасная зона из `react-native-safe-area-context`), а высота карточки берётся из её реального `onLayout` (с фолбэком `TOOLTIP_ESTIMATED_HEIGHT` до первого замера). Так кнопки «Назад»/«Далее»/«Готово» не уезжают под навбар.
6. **Шаги** — `TourTooltip` (`ui/TourTooltip.tsx`): заголовок шага, текст, счётчик «Шаг N из M», «Назад» (кроме первого шага), «Далее» (на последнем — «Готово») и крестик «Завершить обзор». Шагами управляют экшены `goToNextOnboardingStep` / `goToPrevOnboardingStep` (индексы клампятся на границах).
7. **Завершение** — «Готово» и крестик вызывают `endOnboardingTour` (сбрасывает тур и измеренные rect'ы). **Android back** тоже завершает тур: `Modal.onRequestClose={end}` (аппаратная кнопка «Назад»).
8. **Цель и деградация** — если у шага нет `targetId`, карточка показывается сразу по центру (`hole = null`). Если `targetId` есть и rect уже зарегистрирован — вырезается «дырка» и карточка позиционируется рядом с целью. Если `targetId` есть, но rect ещё не измерен (например, сразу после перехода на другой экран), затемнение рисуется **без карточки**, запускается таймер `MISSING_TARGET_TIMEOUT_MS = 1200` мс (сбрасывается при смене шага), и по его истечении карточка показывается по центру (`computeTooltipLayout` возвращает `(windowHeight − bottomInset − tooltipHeight) / 2`). Это предотвращает мигание карточки на старом экране до измерения цели на новом.

## Автозапуск

Помимо ручного запуска через «?», два сценария стартуют автоматически при холодном старте (`useAutoTours`, `lib/useAutoTours.ts`; вызывается в `app/_RootLayout.tsx` рядом с другими стартовыми хуками):

- **`welcome`** — при первом запуске (ключа `tours_seen_version` в AsyncStorage ещё нет): короткая экскурсия по приложению.
- **`whatsNew`** — при смене версии: если сохранённая версия не совпадает с текущей `APP_VERSION`, показывается обзор новинок релиза.

Оба сценария — **авто-сценарии**: они помечены `sinceVersion` и не показываются в пикере (см. «Сценарии»). Алгоритм `useAutoTours`:

1. Через задержку `AUTO_TOUR_DELAY_MS = 2500` мс (дать холодному старту устояться) хук проверяет настройку «Обзоры и подсказки». Если она выключена (`toursDisabledAtom === true`) — **ничего не делает и не пишет** `tours_seen_version`: включение подсказок позже покажет `welcome` на следующем запуске.
2. Иначе читает `tours_seen_version` и решает `resolveAutoTour(seen, APP_VERSION)` (`lib/resolveAutoTour.ts`, чистая функция): нет ключа → `'welcome'`, версия не совпадает → `'whatsNew'`, совпадает → `null` (ничего).
3. Если решение не `null`, **сначала** отмечает версию просмотренной (`setToursSeenVersion(APP_VERSION)`), и только потом запускает тур (`startOnboardingTour`). Отметка «до запуска» означает, что закрытие/пропуск обзора тоже считается просмотром.
4. Если в этот момент уже идёт ручной тур (`onboardingTourAtom` не пуст) — старт пропускается, но версия всё равно отмечается.

Таймер очищается при размонтировании; повторное срабатывание подавляется ref-гвардом — за холодный старт решение принимается один раз.

## Сценарии

Все 9 сценариев определены в `lib/scenarioData/` и собраны в `lib/scenarios.ts` (`scenarios` — порядок показа в пикере, `scenariosById` — доступ по id). Сценарий — `{ id, title, description, icon, featureFlag?, sinceVersion?, steps }`, шаг — `{ title, text, targetId?, route? }`. `route` — маршрут экрана, на котором живёт шаг (отсутствует = текущий экран); именно он делает тур многоэкранным. `sinceVersion` помечает **авто-сценарий** (недоступен в пикере, запускается только автозапуском): `welcome` и `whatsNew` (см. «Автозапуск»); остальные 7 сценариев доступны в пикере «Что посмотреть?».

| id          | Название                      | Флаг / авто | Шаги (цели)                                                                                         |
| ----------- | ----------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `welcome`   | Добро пожаловать              | авто        | «Добро пожаловать!» (`/listen`), `listen.sections`, `listen.search-toggle`, `listen.my-playlists`, `player.mini`, `more.menu` (`/more`), `settings.theme` (`/settings`), `settings.tours` (`/settings`) |
| `whatsNew`  | Что нового                    | авто        | «Обзоры в приложении» (без цели), `settings.tours` (`/settings`)                                     |
| `listen`    | Как слушать проповеди         | —           | `listen.sections`, `listen.search-toggle`, `listen.continue-listening`, `listen.my-playlists`, `player.mini` |
| `playlists` | Плейлисты                     | —           | `listen.my-playlists` (`/listen`), `playlists.create` (`/listen/my-playlists`), «Добавить проповедь» (без цели) |
| `history`   | История прослушивания         | —           | `more.history-item` (`/more`), `history.rows` (`/history`), `history.header-menu`                     |
| `offline`   | Офлайн-режим                  | —           | `more.offline-item` (`/more`), `offline.caching-switch` (`/offline`), `offline.rows` (`/offline`), `offline.header-menu` |
| `settings`  | Настройки и резервные копии   | —           | `more.settings-item` (`/more`), `settings.theme` (`/settings`), `settings.haptics`, `settings.tours`, `settings.backup`, `settings.server` |
| `read`      | Читать книги                  | `read`      | «Библиотека книг» (без цели), `read.notes`, `read.verse-by-verse`, `read.topical`                    |
| `study`     | Учиться                       | `study`     | `study.tabs`, «Материалы» (без цели)                                                                |

**Сценарии многоэкранные**: шаг с `route` переводит тур на нужный экран (например, «Плейлисты»: `/listen` → `/listen/my-playlists`; «Офлайн»/«История»/«Настройки»: стартовый шаг на `/more`, затем целевой экран). Навигацию делает сам оверлей: если `pathname` не совпадает с `step.route`, выполняется `router.push(step.route)`. Пока цель на новом экране не измерена, карточка скрыта (см. п. 8), поэтому переход не мигает; если цель так и не появилась, через `MISSING_TARGET_TIMEOUT_MS = 1200` мс карточка показывается по центру как текстовая. Шаг без `route` остаётся на текущем экране (текстовые карточки).

## Цели подсветки

### Регистрация rect'а

- **`OnboardingTarget`** (`ui/OnboardingTarget.tsx`) — обёртка `View` (`collapsable={false}`) вокруг подсвечиваемого элемента. Регистрирует `window`-rect через `measureInWindow`, когда её `id` совпадает с `targetId` активного шага (`useTargetMeasure`, `lib/useTargetMeasure.ts`). `id` **опционален**: при `id === undefined` компонент отдаёт `children` «как есть» (фрагмент, без `View`, без подписки на навигацию и без измерений), поэтому его можно вешать безусловно.
- **`useOnboardingTargetRef`** (`lib/useOnboardingTargetRef.ts`) — для элементов, которые владеют собственным позиционированием (абсолютно спозиционированный мини-плеер): хук возвращает ref, который вешают прямо на узел, чтобы не вводить лишний `View` и не сломать layout. Используется в `CollapsedMiniPlayer` для `player.mini`.
- **Когда измеряем**: при активации шага (через `MEASURE_DELAY_MS = 100` мс — дать layout устояться), на `onLayout` активной цели и на навигационном событии `transitionEnd` (нативный стек) — тур перемеряет цели после перехода на другой экран. Пустые rect'ы (`width`/`height` = 0) не регистрируются.
- **Где хранится**: `onboardingTargetRectsAtom` (`Record<id, rect>`); при старте тура очищается.

### Компоненты, владеющие своей целью (`onboardingTargetId`)

Переиспользуемые компоненты **сами оборачивают свой корень** в `OnboardingTarget` и принимают опциональный проп `onboardingTargetId`. Call-site только передаёт id — внешняя обёртка не нужна:

| Компонент                            | Проп на call-site        |
| ------------------------------------ | ------------------------ |
| `MoreMenuSettingsItem`               | `more.offline-item`, `more.history-item`, `more.settings-item` |
| `SettingsItem`                       | `settings.theme`         |
| `HapticsSettingsItem`                | `settings.haptics`       |
| `ToursSettingsItem`                  | `settings.tours`         |
| `ServerUrlSettings`                  | `settings.server`        |
| `SermonCachingHeaderSwitch`          | `offline.caching-switch` |
| `OfflineHeaderMenu`                  | `offline.header-menu`    |
| `MyPlaylistsCreateRow`               | `playlists.create`       |
| `ContinueListeningButton`            | `listen.continue-listening` |
| `DynamicSectionsSlider`              | `listen.sections`        |
| `MyPlaylistsSlider`                  | `listen.my-playlists`    |
| `NotesForPreachersBooksSlider`       | `read.notes`             |
| `VerseByVerseBooksSlider`            | `read.verse-by-verse`    |
| `TopicalAndThematicBooksSlider`      | `read.topical`           |

Явный `OnboardingTarget`/`useOnboardingTargetRef` на call-site остаётся **только** там, где компонент не может обернуть себя сам:

- **Структурные элементы** — `FlatList` (`offline.rows`, `history.rows`), `TabView` (`study.tabs`), сырой контейнер (`more.menu`): обёртка вокруг контейнера несёт ещё и стиль (`flex: 1`), её нельзя спрятать внутрь;
- **Кросс-слойные компоненты** — `SearchToggleButton` (`features/sermon-search`, `listen.search-toggle`) и `BackupSection` (`features/settings-backup`, `settings.backup`): фича не может импортировать фичу, поэтому оборачивает экран-владелец;
- **Мини-плеер** — `player.mini` через `useOnboardingTargetRef` (узел владеет собственным позиционированием).

### ids (по сценариям)

| id                         | Где зарегистрирован                                                       | Что подсвечивает                                        |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| `listen.sections`          | `pages/listen/ui/DynamicSectionsSlider.tsx` (`onboardingTargetId`)        | вертикальный блок секций (первый раздел + «Продолжить») |
| `listen.search-toggle`     | `pages/listen/ui/ListenTopRow.tsx`                                        | кнопка-лупа поиска                                      |
| `listen.continue-listening` | `pages/listen/ui/ContinueListeningButton.tsx` (`onboardingTargetId`)     | кнопка «Продолжить прослушивание»                       |
| `listen.my-playlists`      | `pages/listen/ui/MyPlaylistsSlider.tsx` (`onboardingTargetId`)            | секция «Мои плейлисты»                                  |
| `player.mini`              | `widgets/expandable-player/ui/ExpandablePlayer/CollapsedMiniPlayer.tsx` (`useOnboardingTargetRef`) | мини-плеер (только когда есть загруженный трек)         |
| `more.menu`                | `pages/more/ui/MoreScreen.tsx`                                            | блок меню «Ещё» (список пунктов)                        |
| `more.offline-item`        | `pages/more/ui/MoreMenuSettingsItem.tsx` (`onboardingTargetId`)           | пункт меню «Офлайн»                                     |
| `more.history-item`        | `pages/more/ui/MoreMenuSettingsItem.tsx` (`onboardingTargetId`)           | пункт меню «История прослушивания»                      |
| `more.settings-item`       | `pages/more/ui/MoreMenuSettingsItem.tsx` (`onboardingTargetId`)           | пункт меню «Настройки»                                  |
| `playlists.create`         | `pages/my-playlists/ui/MyPlaylistsCreateRow.tsx` (`onboardingTargetId`)   | строка «Создать плейлист» (футер списка)                |
| `history.rows`             | `pages/history/ui/HistoryScreen.tsx`                                      | список записей истории                                  |
| `history.header-menu`      | `pages/history/ui/HistoryScreen.tsx`                                      | меню шапки истории                                      |
| `offline.caching-switch`   | `pages/offline/ui/SermonCachingHeaderSwitch.tsx` (`onboardingTargetId`)   | тумблер кеширования                                     |
| `offline.rows`             | `pages/offline/ui/OfflineScreen.tsx`                                      | список офлайн-проповедей                                |
| `offline.header-menu`      | `pages/offline/ui/OfflineHeaderMenu.tsx` (`onboardingTargetId`)           | меню шапки «Офлайн»                                     |
| `settings.theme`           | `pages/settings/ui/SettingsItem.tsx` (`onboardingTargetId`)               | строка «Тема оформления»                                |
| `settings.haptics`         | `pages/settings/ui/HapticsSettingsItem.tsx` (`onboardingTargetId`)        | строка «Виброотклик»                                    |
| `settings.tours`           | `pages/settings/ui/ToursSettingsItem.tsx` (`onboardingTargetId`)          | строка «Обзоры и подсказки»                             |
| `settings.backup`          | `pages/settings/ui/SettingsScreen.tsx`                                    | блок «Резервная копия данных»                           |
| `settings.server`          | `pages/settings/ui/ServerUrlSettings.tsx` (`onboardingTargetId`)          | строка «URL сервера API»                                |
| `read.notes`               | `pages/read/ui/NotesForPreachersBooksSlider.tsx` (`onboardingTargetId`)   | слайдер «Конспекты для проповедников»                   |
| `read.verse-by-verse`      | `pages/read/ui/VerseByVerseBooksSlider.tsx` (`onboardingTargetId`)        | слайдер «По библии. Стих за стихом»                     |
| `read.topical`             | `pages/read/ui/TopicalAndThematicBooksSlider.tsx` (`onboardingTargetId`)  | слайдер «Тематические и доктринальные»                  |
| `study.tabs`               | `pages/study/ui.tsx`                                                      | `TabView` «Богословие / Душепопечение»                  |

### Как добавить сценарий или цель

1. **Новый сценарий**: добавить файл `lib/scenarioData/<id>.ts` с `OnboardingScenario`, зарегистрировать его в `lib/scenarios.ts` (в `scenarios` и `scenariosById`) и расширить union `OnboardingScenarioId`. Если сценарий должен появляться только по фича-флагу — указать `featureFlag`; если он должен запускаться только автоматически (не показываться в пикере) — указать `sinceVersion` и добавить решение в `lib/resolveAutoTour.ts`.
2. **Новая цель**: если цель — переиспользуемый компонент, добавь ему опциональный проп `onboardingTargetId` и оберни им собственный корень (`<OnboardingTarget id={onboardingTargetId}>`). В остальных случаях оберни элемент в `<OnboardingTarget id='...'>` на call-site (или повесь ref из `useOnboardingTargetRef('...')` на само-позиционируемый узел). В любом варианте прописывается тот же `targetId` в шаге сценария. id — строковый, конвенция `<экран>.<элемент>`.
3. **Многоэкранный шаг**: указать `route` шага — `OnboardingTourOverlay` сам переведёт тур на этот экран (цель на нём должна быть обёрнута в `OnboardingTarget`). Шаг без `route` остаётся на текущем экране.
4. **Текстовый шаг без цели**: просто не указывать `targetId` — карточка отрисуется по центру.

## Архитектура

- Слайс `src/features/onboarding/`:
  - `model.ts` — атомы `onboardingTourAtom` (`{ scenarioId, stepIndex } | null`) и `onboardingTargetRectsAtom`; экшены `startOnboardingTour`, `goToNextOnboardingStep`, `goToPrevOnboardingStep`, `endOnboardingTour`, `registerOnboardingTargetRect`.
  - `lib/` — `scenarios.ts` + `scenarioData/*`, `useOnboardingScenarios` (гейт по флагам и авто-сценариям), `useTargetMeasure`, `useOnboardingTargetRef`, `tooltipPosition` (чистая функция позиции карточки с учётом нижнего инсета), `resolveAutoTour` (чистая функция решения об автозапуске), `useAutoTours` (автозапуск welcome/whatsNew).
  - Настройка «Обзоры и подсказки» (`toursDisabledAtom`, `setToursDisabled`, `loadToursDisabled`) и ключ `tours_seen_version` (`TOURS_SEEN_VERSION_KEY`, `setToursSeenVersion`) живут в `shared/model/settings.ts` (рядом с виброоткликом) и входят в резервную копию; онбординг только читает атом/ключ и пишет версию.
  - `ui/` — `HelpHeaderButton`, `ScenarioPickerModal`, `OnboardingHelpRow`, `OnboardingTarget`, `OnboardingTourOverlay`, `TourDim`, `TourTooltip`.
- **Публичное API** (`index.ts`, 6 экспортов): `HelpHeaderButton`, `OnboardingHelpRow`, `OnboardingTarget`, `OnboardingTourOverlay`, `useAutoTours`, `useOnboardingTargetRef`.
- **Почему overlay смонтирован в `_RootLayout`**: `OnboardingTourOverlay` — один на всё приложение, рендерится поверх любого экрана и модалок независимо от текущего маршрута (`app/_RootLayout.tsx`, рядом с `GlobalErrorDialog`/`GlobalConfirmDialog`). Поэтому тур переживает навигацию: оверлей не размонтируется при `router.push` на маршрут шага (`step.route`).
- **Стабильные module-level header-рендеры**: `headerRight` для под-экранов задаётся функциями, объявленными на уровне модуля (`renderHelp`, `renderSettingsHelpRow` в `_RootLayout.tsx`; `renderHelp` в `app/(tabs)/listen/_layout.tsx`). Это вынужденно: expo-router передаёт `options` в `navigation.setOptions` на каждый рендер, и свежая inline-функция каждый раз «меняет» опции → `setState` → ре-рендер → цикл «Maximum update depth exceeded». Module-level ссылки идентичны между рендерами и цикла не создают (та же причина, что у `renderHeaderBack`).

## Интеграция по экранам

- **Централизованно** — под-экраны корневого стека (`SUB_SCREENS`: `settings`, `history`, `offline`, `about`, `share`) получают «?» из `app/_RootLayout.tsx`: `headerRight: renderHelp`, а `settings` — `renderSettingsHelpRow` («?» + кебаб-меню настроек). Экраны стека «Слушать» (`search-results`, `playlist-list`) получают «?» из `screenOptions.headerRight` в `app/(tabs)/listen/_layout.tsx`.
- **Кастомный `headerRight` через `OnboardingHelpRow`** — экраны, у которых уже есть собственные кнопки в шапке, встраивают «?» в свой ряд: `history` (`HistoryHeaderMenu`), `offline` (тумблер + меню), `playlist` (`PlaylistHeaderMenu`), `my-playlists` (карандаш/«Сохранить»), `playlist-edit` (галочка «Сохранить»). `OnboardingHelpRow` рендерит «?» слева, затем `children`.
- **Безшапочные табы** (`listen`, `read`, `study`, `more`; `headerShown: false`) — «?» стоит в верхнем ряду экрана (in-flow), а не в нативной шапке: `ListenTopRow` (рядом с лупой и щитом админки), `MoreScreen` (рядом с кнопкой «В админ панель»), `ReadScreen`/`StudyScreen` (собственный `topRow` справа).

## Тесты

- `model.test.ts` — старт сбрасывает rect'ы и ставит первый шаг, регистрация/перезапись rect'а, клампы `next`/`prev` на границах, no-op без тура, `end` чистит тур и rect'ы.
- `lib/tooltipPosition.test.ts` — позиция карточки (над/под целью, центрирование без цели, кламп по низу окна, смещение центрирования и нижнего клампа на `bottomInset`).
- `lib/useOnboardingScenarios.test.ts` — `read`/`study` появляются только при включённых флагах, авто-сценарии (`welcome`/`whatsNew`) в пикер не попадают, остальные всегда.
- `lib/resolveAutoTour.test.ts` — нет версии → `welcome`, версия изменилась → `whatsNew`, версия совпала → `null`.
- `lib/scenarios.test.ts` — данные сценариев: у `welcome` 8 шагов и последний на `settings.tours`, у `whatsNew` задан `sinceVersion`.
- `lib/useOnboardingTargetRef.test.tsx` — ref-цель измеряется только при совпадении с активным шагом.
- `ui/HelpHeaderButton.test.tsx` — «?» открывает оффер, «Посмотреть» показывает пикер, «Закрыть» закрывает; при `toursDisabledAtom = true` кнопка не рендерится.
- `src/shared/model/settings.test.ts` — `setToursDisabled` пишет значение и переключает атом, `loadToursDisabled` нормализует `'true'`/`'false'`/отсутствие ключа.
- `pages/settings/ui/ToursSettingsItem.test.tsx` — строка «Обзоры и подсказки» вызывает `setToursDisabled` с инвертированным значением.
- `ui/OnboardingTarget.test.tsx` — цель регистрирует rect при активном шаге; без `id` рендерит `children` и ничего не регистрирует.
- `pages/more/ui/MoreMenuSettingsItem.test.tsx` — при заданном `onboardingTargetId` и активном шаге строка регистрирует свой rect; без пропа регистрации нет.
- `ui/OnboardingTourOverlay.test.tsx` — пусто без тура; шаг с целью и готовым rect (карточка + «Далее» + close); шаг без цели (карточка + «Назад»); «Готово» на последнем шаге; шаг с `route` → `router.push` вызывается с этим маршрутом при несовпадении `pathname`; шаг с `targetId` без rect → карточка скрыта и появляется после истечения `MISSING_TARGET_TIMEOUT_MS`.

## Связанные документы

- [feature-flags.md](./feature-flags.md) — гейтинг сценариев `read`/`study`
- [navigation.md](./navigation.md) — маршруты и стеки
- [state.md](./state.md) — Reatom-паттерны
- [screens/listen.md](../screens/listen.md), [screens/settings.md](../screens/settings.md), [screens/history.md](../screens/history.md), [screens/offline.md](../screens/offline.md) — целевые экраны
- [contracts/storage.md](../contracts/storage.md) — ключи `tours_disabled` / `tours_seen_version`
- [features/settings-backup.md](./settings-backup.md) — бэкап настроек онбординга

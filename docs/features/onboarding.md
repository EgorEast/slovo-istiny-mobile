# Онбординг (обзор возможностей)

**Слой:** `features/onboarding`
**Статус:** готов

## Что это

Кнопка «?» в шапке пользовательских экранов открывает пошаговый обзор возможностей приложения — без видео и внешних инструкций, прямо на реальном интерфейсе. Поток: тап по «?» → оффер-диалог «Обзор приложения» («Посмотреть» / «Закрыть») → модалка выбора сценария «Что посмотреть?» → спотлайт-тур: экран затемняется, вокруг реального элемента UI «вырезается» дырка, рядом показывается карточка шага с заголовком, текстом, счётчиком и кнопками «Назад» / «Далее» / «Готово».

Пользовательская ценность — ненавязчиво объяснить, что где находится (поиск, продолжение прослушивания, плейлисты, офлайн, настройки, чтение, обучение), показывая настоящие элементы, а не скриншоты: если вёрстка изменится, тур останется корректным.

## Как работает (поток «?»)

1. **Кнопка «?»** — `HelpHeaderButton` (`ui/HelpHeaderButton.tsx`): `IconButton` с иконкой `help-circle-outline`, `accessibilityLabel` «Онбординг и помощь». Локальный `useState` ведёт поток по трём состояниям `idle → offer → picker`. Если включена настройка «Обзоры и подсказки» (`toursDisabledAtom`, дефолт — подсказки включены) — кнопка рендерит `null` (шапка/меню остаются на месте).
2. **Оффер-диалог** — общий `ConfirmDialog` «Обзор приложения» («Хотите посмотреть, как пользоваться приложением?») с кнопками «Посмотреть» / «Закрыть». «Посмотреть» переводит в `picker`, «Закрыть» возвращает в `idle`.
3. **Выбор сценария** — `ScenarioPickerModal` (`ui/ScenarioPickerModal.tsx`, заголовок «Что посмотреть?») со списком доступных сценариев (иконка, название, описание). Список строит `useOnboardingScenarios` — он отфильтровывает `read`/`study` по фича-флагам `read`/`study` (см. [feature-flags.md](./feature-flags.md)); при выключенном флаге сценария в списке нет.
4. **Старт тура** — тап по сценарию закрывает модалку и сразу вызывает `startOnboardingTour(scenarioId)` (без отдельной навигации и задержки). Навигацию по шагам делает сам оверлей: у шага может быть `route`, и `OnboardingTourOverlay` следит за активным шагом — если `pathname` не совпадает с `step.route`, выполняется `router.push(step.route)`. Так многоэкранный тур переходит между экранами между шагами.
5. **Тур** — `OnboardingTourOverlay` (`ui/OnboardingTourOverlay.tsx`): `Modal` (`transparent`, `animationType='fade'`, `statusBarTranslucent`) с двумя слоями — затемнение `TourDim` и карточка `TourTooltip`.
6. **Шаги** — `TourTooltip` (`ui/TourTooltip.tsx`): заголовок шага, текст, счётчик «Шаг N из M», «Назад» (кроме первого шага), «Далее» (на последнем — «Готово») и крестик «Завершить обзор». Шагами управляют экшены `goToNextOnboardingStep` / `goToPrevOnboardingStep` (индексы клампятся на границах).
7. **Завершение** — «Готово» и крестик вызывают `endOnboardingTour` (сбрасывает тур и измеренные rect'ы). **Android back** тоже завершает тур: `Modal.onRequestClose={end}` (аппаратная кнопка «Назад»).
8. **Цель и деградация** — если у шага нет `targetId`, карточка показывается сразу по центру (`hole = null`). Если `targetId` есть и rect уже зарегистрирован — вырезается «дырка» и карточка позиционируется рядом с целью. Если `targetId` есть, но rect ещё не измерен (например, сразу после перехода на другой экран), затемнение рисуется **без карточки**, запускается таймер `MISSING_TARGET_TIMEOUT_MS = 1200` мс (сбрасывается при смене шага), и по его истечении карточка показывается по центру (`computeTooltipLayout` возвращает `(windowHeight − tooltipHeight) / 2`). Это предотвращает мигание карточки на старом экране до измерения цели на новом.

## Сценарии

Все 7 сценариев определены в `lib/scenarioData/` и собраны в `lib/scenarios.ts` (`scenarios` — порядок показа в пикере, `scenariosById` — доступ по id). Сценарий — `{ id, title, description, icon, homeRoute, featureFlag?, steps }`, шаг — `{ title, text, targetId?, route? }`. `route` — маршрут экрана, на котором живёт шаг (отсутствует = текущий экран); именно он делает тур многоэкранным. `homeRoute` остаётся метаданными сценария (пикер/описание), навигацию ведёт оверлей по `route` шага.

| id          | Название                      | Домашний маршрут | Флаг    | Шаги (цели)                                                                                         |
| ----------- | ----------------------------- | ---------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `listen`    | Как слушать проповеди         | `/listen`        | —       | `listen.sections`, `listen.search-toggle`, `listen.continue-listening`, `listen.my-playlists`, `player.mini` |
| `playlists` | Плейлисты                     | `/listen`        | —       | `listen.my-playlists` (`/listen`), `playlists.create` (`/listen/my-playlists`), «Добавить проповедь» (без цели) |
| `history`   | История прослушивания         | `/history`       | —       | `more.history-item` (`/more`), `history.rows` (`/history`), `history.header-menu`                     |
| `offline`   | Офлайн-режим                  | `/offline`       | —       | `more.offline-item` (`/more`), `offline.caching-switch` (`/offline`), `offline.rows` (`/offline`), `offline.header-menu` |
| `settings`  | Настройки и резервные копии   | `/settings`      | —       | `more.settings-item` (`/more`), `settings.theme` (`/settings`), `settings.haptics`, `settings.tours`, `settings.backup`, `settings.server` |
| `read`      | Читать книги                  | `/read`          | `read`  | «Библиотека книг» (без цели), `read.notes`, `read.verse-by-verse`, `read.topical`                    |
| `study`     | Учиться                       | `/study`         | `study` | `study.tabs`, «Материалы» (без цели)                                                                |

**Сценарии многоэкранные**: шаг с `route` переводит тур на нужный экран (например, «Плейлисты»: `/listen` → `/listen/my-playlists`; «Офлайн»/«История»/«Настройки»: стартовый шаг на `/more`, затем целевой экран). Пока цель на новом экране не измерена, карточка скрыта (см. п. 8), поэтому переход не мигает. Шаг без `route` остаётся на текущем экране (текстовые карточки).

## Цели подсветки

### Регистрация rect'а

- **`OnboardingTarget`** (`ui/OnboardingTarget.tsx`) — обёртка `View` (`collapsable={false}`) вокруг подсвечиваемого элемента. Регистрирует `window`-rect через `measureInWindow`, когда её `id` совпадает с `targetId` активного шага (`useTargetMeasure`, `lib/useTargetMeasure.ts`).
- **`useOnboardingTargetRef`** (`lib/useOnboardingTargetRef.ts`) — для элементов, которые владеют собственным позиционированием (абсолютно спозиционированный мини-плеер): хук возвращает ref, который вешают прямо на узел, чтобы не вводить лишний `View` и не сломать layout. Используется в `CollapsedMiniPlayer` для `player.mini`.
- **Когда измеряем**: при активации шага (через `MEASURE_DELAY_MS = 100` мс — дать layout устояться), на `onLayout` активной цели и на навигационном событии `transitionEnd` (нативный стек) — тур перемеряет цели после перехода на другой экран. Пустые rect'ы (`width`/`height` = 0) не регистрируются.
- **Где хранится**: `onboardingTargetRectsAtom` (`Record<id, rect>`); при старте тура очищается.

### ids (по сценариям)

| id                         | Где зарегистрирован                                                       | Что подсвечивает                                        |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| `listen.sections`          | `pages/listen/ui/ListenScreen.tsx`                                        | вертикальный блок секций (первый раздел + «Продолжить») |
| `listen.search-toggle`     | `pages/listen/ui/ListenTopRow.tsx`                                        | кнопка-лупа поиска                                      |
| `listen.continue-listening` | `pages/listen/ui/ListenScreen.tsx`                                        | кнопка «Продолжить прослушивание»                       |
| `listen.my-playlists`      | `pages/listen/ui/ListenScreen.tsx`                                        | секция «Мои плейлисты»                                  |
| `player.mini`              | `widgets/expandable-player/ui/ExpandablePlayer/CollapsedMiniPlayer.tsx` (`useOnboardingTargetRef`) | мини-плеер (только когда есть загруженный трек)         |
| `more.offline-item`        | `pages/more/ui/MoreScreen.tsx`                                            | пункт меню «Офлайн»                                     |
| `more.history-item`        | `pages/more/ui/MoreScreen.tsx`                                            | пункт меню «История прослушивания»                      |
| `more.settings-item`       | `pages/more/ui/MoreScreen.tsx`                                            | пункт меню «Настройки»                                  |
| `playlists.create`         | `pages/my-playlists/ui/MyPlaylistsNormalView.tsx`                         | строка «Создать плейлист» (футер списка)                |
| `history.rows`             | `pages/history/ui/HistoryScreen.tsx`                                      | список записей истории                                  |
| `history.header-menu`      | объявлен в сценарии, но `OnboardingTarget` пока не обёрнут                | меню шапки истории; шаг деградирует в центрированную карточку |
| `offline.caching-switch`   | `pages/offline/ui/OfflineScreen.tsx`                                      | тумблер кеширования                                     |
| `offline.rows`             | `pages/offline/ui/OfflineScreen.tsx`                                      | список офлайн-проповедей                                |
| `offline.header-menu`      | `pages/offline/ui/OfflineScreen.tsx`                                      | меню шапки «Офлайн»                                     |
| `settings.theme`           | `pages/settings/ui/SettingsScreen.tsx`                                    | строка «Тема оформления»                                |
| `settings.haptics`         | `pages/settings/ui/SettingsScreen.tsx`                                    | строка «Виброотклик»                                    |
| `settings.tours`           | `pages/settings/ui/SettingsScreen.tsx`                                    | строка «Обзоры и подсказки»                             |
| `settings.backup`          | `pages/settings/ui/SettingsScreen.tsx`                                    | блок «Резервная копия данных»                           |
| `settings.server`          | `pages/settings/ui/SettingsScreen.tsx`                                    | строка «URL сервера API»                                |
| `read.notes`               | `pages/read/ui/ReadScreen.tsx`                                            | слайдер «Конспекты для проповедников»                   |
| `read.verse-by-verse`      | `pages/read/ui/ReadScreen.tsx`                                            | слайдер «По библии. Стих за стихом»                     |
| `read.topical`             | `pages/read/ui/ReadScreen.tsx`                                            | слайдер «Тематические и доктринальные»                  |
| `study.tabs`               | `pages/study/ui.tsx`                                                      | `TabView` «Богословие / Душепопечение»                  |

### Как добавить сценарий или цель

1. **Новый сценарий**: добавить файл `lib/scenarioData/<id>.ts` с `OnboardingScenario`, зарегистрировать его в `lib/scenarios.ts` (в `scenarios` и `scenariosById`) и расширить union `OnboardingScenarioId`. Если сценарий должен появляться только по фича-флагу — указать `featureFlag`.
2. **Новая цель**: обернуть элемент в `<OnboardingTarget id='...'>` (или повесить ref из `useOnboardingTargetRef('...')` на само-позиционируемый узел) и прописать тот же `targetId` в шаге сценария. id — строковый, конвенция `<экран>.<элемент>`.
3. **Многоэкранный шаг**: указать `route` шага — `OnboardingTourOverlay` сам переведёт тур на этот экран (цель на нём должна быть обёрнута в `OnboardingTarget`). Шаг без `route` остаётся на текущем экране.
4. **Текстовый шаг без цели**: просто не указывать `targetId` — карточка отрисуется по центру.

## Архитектура

- Слайс `src/features/onboarding/`:
  - `model.ts` — атомы `onboardingTourAtom` (`{ scenarioId, stepIndex } | null`) и `onboardingTargetRectsAtom`; экшены `startOnboardingTour`, `goToNextOnboardingStep`, `goToPrevOnboardingStep`, `endOnboardingTour`, `registerOnboardingTargetRect`.
  - `lib/` — `scenarios.ts` + `scenarioData/*`, `useOnboardingScenarios` (гейт по флагам), `useTargetMeasure`, `useOnboardingTargetRef`, `tooltipPosition` (чистая функция позиции карточки).
  - Настройка «Обзоры и подсказки» (`toursDisabledAtom`, `setToursDisabled`, `loadToursDisabled`, `setToursSeenVersion`) живёт в `shared/model/settings.ts` (рядом с виброоткликом) и входит в резервную копию; онбординг только читает атом.
  - `ui/` — `HelpHeaderButton`, `ScenarioPickerModal`, `OnboardingHelpRow`, `OnboardingTarget`, `OnboardingTourOverlay`, `TourDim`, `TourTooltip`.
- **Публичное API** (`index.ts`, 5 экспортов): `HelpHeaderButton`, `OnboardingHelpRow`, `OnboardingTarget`, `OnboardingTourOverlay`, `useOnboardingTargetRef`.
- **Почему overlay смонтирован в `_RootLayout`**: `OnboardingTourOverlay` — один на всё приложение, рендерится поверх любого экрана и модалок независимо от текущего маршрута (`app/_RootLayout.tsx`, рядом с `GlobalErrorDialog`/`GlobalConfirmDialog`). Поэтому тур переживает навигацию: оверлей не размонтируется при `router.push` на `homeRoute`.
- **Стабильные module-level header-рендеры**: `headerRight` для под-экранов задаётся функциями, объявленными на уровне модуля (`renderHelp`, `renderSettingsHelpRow` в `_RootLayout.tsx`; `renderHelp` в `app/(tabs)/listen/_layout.tsx`). Это вынужденно: expo-router передаёт `options` в `navigation.setOptions` на каждый рендер, и свежая inline-функция каждый раз «меняет» опции → `setState` → ре-рендер → цикл «Maximum update depth exceeded». Module-level ссылки идентичны между рендерами и цикла не создают (та же причина, что у `renderHeaderBack`).

## Интеграция по экранам

- **Централизованно** — под-экраны корневого стека (`SUB_SCREENS`: `settings`, `history`, `offline`, `about`, `share`) получают «?» из `app/_RootLayout.tsx`: `headerRight: renderHelp`, а `settings` — `renderSettingsHelpRow` («?» + кебаб-меню настроек). Экраны стека «Слушать» (`search-results`, `playlist-list`) получают «?» из `screenOptions.headerRight` в `app/(tabs)/listen/_layout.tsx`.
- **Кастомный `headerRight` через `OnboardingHelpRow`** — экраны, у которых уже есть собственные кнопки в шапке, встраивают «?» в свой ряд: `history` (`HistoryHeaderMenu`), `offline` (тумблер + меню), `playlist` (`PlaylistHeaderMenu`), `my-playlists` (карандаш/«Сохранить»), `playlist-edit` (галочка «Сохранить»). `OnboardingHelpRow` рендерит «?» слева, затем `children`.
- **Безшапочные табы** (`listen`, `read`, `study`, `more`; `headerShown: false`) — «?» стоит в верхнем ряду экрана (in-flow), а не в нативной шапке: `ListenTopRow` (рядом с лупой и щитом админки), `MoreScreen` (рядом с кнопкой «В админ панель»), `ReadScreen`/`StudyScreen` (собственный `topRow` справа).

## Тесты

- `model.test.ts` — старт сбрасывает rect'ы и ставит первый шаг, регистрация/перезапись rect'а, клампы `next`/`prev` на границах, no-op без тура, `end` чистит тур и rect'ы.
- `lib/tooltipPosition.test.ts` — позиция карточки (над/под целью, центрирование без цели, кламп по низу окна).
- `lib/useOnboardingScenarios.test.ts` — `read`/`study` появляются только при включённых флагах, остальные всегда.
- `lib/useOnboardingTargetRef.test.tsx` — ref-цель измеряется только при совпадении с активным шагом.
- `ui/HelpHeaderButton.test.tsx` — «?» открывает оффер, «Посмотреть» показывает пикер, «Закрыть» закрывает; при `toursDisabledAtom = true` кнопка не рендерится.
- `src/shared/model/settings.test.ts` — `setToursDisabled` пишет значение и переключает атом, `loadToursDisabled` нормализует `'true'`/`'false'`/отсутствие ключа.
- `pages/settings/ui/ToursSettingsItem.test.tsx` — строка «Обзоры и подсказки» вызывает `setToursDisabled` с инвертированным значением.
- `ui/OnboardingTarget.test.tsx` — цель регистрирует rect при активном шаге.
- `ui/OnboardingTourOverlay.test.tsx` — пусто без тура; шаг с целью и готовым rect (карточка + «Далее» + close); шаг без цели (карточка + «Назад»); «Готово» на последнем шаге; шаг с `route` → `router.push` вызывается с этим маршрутом при несовпадении `pathname`; шаг с `targetId` без rect → карточка скрыта и появляется после истечения `MISSING_TARGET_TIMEOUT_MS`.

## Связанные документы

- [feature-flags.md](./feature-flags.md) — гейтинг сценариев `read`/`study`
- [navigation.md](./navigation.md) — маршруты и стеки
- [state.md](./state.md) — Reatom-паттерны
- [screens/listen.md](../screens/listen.md), [screens/settings.md](../screens/settings.md), [screens/history.md](../screens/history.md), [screens/offline.md](../screens/offline.md) — целевые экраны
- [debt.md](../debt.md) — автозапуск и персистентность онбординга

# Онбординг (обзор возможностей)

**Слой:** `features/onboarding`
**Статус:** готов

## Что это

Кнопка «?» в шапке пользовательских экранов открывает пошаговый обзор возможностей приложения — без видео и внешних инструкций, прямо на реальном интерфейсе. Поток: тап по «?» → модалка выбора сценария «Что посмотреть?» → спотлайт-тур: экран затемняется, вокруг реального элемента UI «вырезается» дырка, рядом показывается карточка шага с заголовком, текстом, счётчиком и кнопками «Назад» / «Далее» / «Готово». Если шаг интерактивный (`waitFor`), кнопка «Далее» скрыта до выполнения действия — вместо неё подсказка «Выполните действие, чтобы продолжить».

Пользовательская ценность — ненавязчиво объяснить, что где находится (поиск, продолжение прослушивания, плейлисты, офлайн, настройки, чтение, обучение), показывая настоящие элементы, а не скриншоты: если вёрстка изменится, тур останется корректным.

## Как работает (поток «?»)

1. **Кнопка «?»** — `HelpHeaderButton` (`ui/HelpHeaderButton.tsx`): `IconButton` с иконкой `help-circle-outline`, `accessibilityLabel` «Онбординг и помощь». Локальный `useState` (`isPickerOpen`) сразу открывает `ScenarioPickerModal` — оффер-диалога больше нет. Если настройка «Обзоры и подсказки» выключена (`toursDisabledAtom === true`, дефолт — подсказки включены) — кнопка рендерит `null` (шапка/меню остаются на месте), а автозапуск туров блокируется (см. «Автозапуск»).
2. **Выбор сценария** — `ScenarioPickerModal` (`ui/ScenarioPickerModal.tsx`, заголовок «Что посмотреть?») со списком сценариев (иконка, название, описание). Список строит `useOnboardingScenarios`: `read`/`study` фильтруются по фича-флагам `read`/`study` (см. [feature-flags.md](./feature-flags.md)); авто-сценарии (`welcome`/`whatsNew`) в пикере **есть** (можно пересмотреть вручную) и стоят в конце списка.
3. **Старт тура** — тап по сценарию закрывает модалку и сразу вызывает `startOnboardingTour(scenarioId)`. Навигацию по шагам делает сам оверлей: у шага может быть `route`, и `OnboardingTourOverlay` следит за активным шагом — маршрут вычисляет чистая `resolveStepRoute` (собственный `route` шага, иначе ближайший предыдущий; шаг без `route` наследует экран предыдущего шага), и при несовпадении `pathname` выполняется `router.navigate(route)` (`navigate`, а не `push` — переиспользует существующие записи стека, без дублирования). Пока роутер переходит на маршрут шага, оверлей **скрыт целиком** (`isNavigatingToStep`): пользователь видит настоящую анимацию таба/стека, а оверлей возвращается, когда `pathname` догоняет. Так многоэкранный тур переходит между экранами.
4. **Симуляция нажатия** — если у шага задан `tapTargetId` (элемент, по которому тур «нажимает», чтобы попасть на маршрут), его rect уже измерен и видим, — перед навигацией оверлей показывает `TapIndicator` (`ui/TapIndicator.tsx`): пульсирующий круг (~56px, `currentTheme.primary`) по центру элемента, мигающий 3 раза (~800ms каждый) через `withRepeat(withSequence(...), 3)`. Во время мигания затемнение и карточка **не** рисуются (живой интерфейс виден), навигация приостановлена; через `TAP_PHASE_MS = 2400` мс фаза снимается и выполняется переход. Если `tapTargetId` нет или rect не измерен — переход происходит сразу (как в п. 3).
5. **Тур** — `OnboardingTourOverlay` (`ui/OnboardingTourOverlay.tsx`): `Modal` (`transparent`, `animationType='fade'`, `statusBarTranslucent`, `navigationBarTranslucent`) с двумя слоями — затемнение `TourDim` и карточка `TourTooltip`. Карточка позиционируется с учётом системной навигационной панели: высота окна (`useWindowDimensions`) на Android edge-to-edge включает зону под системным навбаром, поэтому нижняя граница позиции отсчитывается от `windowHeight − insets.bottom` (безопасная зона из `react-native-safe-area-context`), а высота карточки берётся из её реального `onLayout` (с фолбэком `TOOLTIP_ESTIMATED_HEIGHT` до первого замера). Так кнопки «Назад»/«Далее»/«Готово» не уезжают под навбар.
6. **Шаги** — `TourTooltip` (`ui/TourTooltip.tsx`): заголовок шага, текст, счётчик «Шаг N из M», «Назад» (кроме первого шага), «Далее» (на последнем — «Готово») и крестик «Завершить обзор». Для интерактивного шага (`waitFor`) с невыполненным условием кнопка «Далее» скрыта, вместо неё muted-подсказка «Выполните действие, чтобы продолжить»; «Назад» и крестик работают всегда. Условие считает `useWaitForSatisfied` по атомам плеера (`currentAudioAtom`/`isPlayingAtom` через `entities/player/@x/onboarding`): `sermonSelected` — выбран трек, `paused` — трек выбран и не играет. Шагами управляют экшены `goToNextOnboardingStep` / `goToPrevOnboardingStep` (индексы клампятся на границах).
7. **Завершение** — «Готово» и крестик вызывают `endOnboardingTour` (сбрасывает тур и измеренные rect'ы). **Android back** тоже завершает тур: `Modal.onRequestClose={end}` (аппаратная кнопка «Назад»).
8. **Цель и деградация** — если у шага нет `targetId`, карточка показывается сразу по центру (`hole = null`). Если `targetId` есть и rect уже зарегистрирован — вырезается «дырка» и карточка позиционируется рядом с целью. Если `targetId` есть, но rect ещё не измерен (например, сразу после перехода на другой экран), затемнение рисуется **без карточки**, запускается таймер `MISSING_TARGET_TIMEOUT_MS = 1200` мс (сбрасывается при смене шага), и по его истечении карточка показывается по центру (`computeTooltipLayout` возвращает `(windowHeight − bottomInset − tooltipHeight) / 2`). Это предотвращает мигание карточки на старом экране до измерения цели на новом.

## Автозапуск

Помимо ручного запуска через «?», два сценария стартуют автоматически при холодном старте (`useAutoTours`, `lib/useAutoTours.ts`; вызывается в `app/_RootLayout.tsx` рядом с другими стартовыми хуками):

- **`welcome`** — при первом запуске (ключа `tours_seen_version` в AsyncStorage ещё нет): короткая экскурсия по приложению.
- **`whatsNew`** — при смене версии: если сохранённая версия не совпадает с текущей `APP_VERSION`, показывается обзор новинок релиза.

Оба сценария — **авто-сценарии**: помечены `sinceVersion` (запускаются автозапуском), при этом доступны в пикере для ручного повтора (в конце списка). Алгоритм `useAutoTours`:

1. Через задержку `AUTO_TOUR_DELAY_MS = 2500` мс (дать холодному старту устояться) хук проверяет настройку «Обзоры и подсказки». Если она выключена (`toursDisabledAtom === true`) — **ничего не делает и не пишет** `tours_seen_version`: включение подсказок позже покажет `welcome` на следующем запуске.
2. Иначе читает `tours_seen_version` и решает `resolveAutoTour(seen, APP_VERSION)` (`lib/resolveAutoTour.ts`, чистая функция): нет ключа → `'welcome'`, версия не совпадает → `'whatsNew'`, совпадает → `null` (ничего).
3. Если решение не `null`, **сначала** отмечает версию просмотренной (`setToursSeenVersion(APP_VERSION)`), и только потом запускает тур (`startOnboardingTour`). Отметка «до запуска» означает, что закрытие/пропуск обзора тоже считается просмотром.
4. Если в этот момент уже идёт ручной тур (`onboardingTourAtom` не пуст) — старт пропускается, но версия всё равно отмечается.

Таймер очищается при размонтировании; повторное срабатывание подавляется ref-гвардом — за холодный старт решение принимается один раз.

## Сценарии

Все 10 сценариев определены в `lib/scenarioData/` и собраны в `lib/scenarios.ts` (`scenarios` — порядок показа в пикере, `scenariosById` — доступ по id). Сценарий — `{ id, title, description, icon, featureFlag?, sinceVersion?, steps }`, шаг — `{ title, text, targetId?, tapTargetId?, route?, waitFor? }`. `route` — маршрут экрана, на котором живёт шаг; шаг без `route` наследует маршрут ближайшего предыдущего (`resolveStepRoute`), поэтому все шаги сценария живут на конкретных экранах. `tapTargetId` — элемент, по которому тур «нажимает» при переходе на маршрут шага (см. «Симуляция нажатия»). `waitFor` (`sermonSelected` | `paused`) делает шаг интерактивным: «Далее» скрыта, пока действие не выполнено. `sinceVersion` помечает **авто-сценарий** (запускается автозапуском, но также доступен в пикере для ручного повтора): `welcome` и `whatsNew` (см. «Автозапуск»); в пикере они стоят в конце списка.

| id          | Название                      | Флаг / авто | Шаги (цели)                                                                                         |
| ----------- | ----------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `listen`    | Как слушать проповеди         | —           | `listen.sections` (`/listen`), `listen.search-toggle`, `listen.continue-listening`, `listen.my-playlists`, `player.mini` |
| `player`    | Плеер                         | —           | `listen.sections` (`/listen`, `waitFor: sermonSelected`), `player.mini`, `player.mini` (`waitFor: paused`) |
| `playlists` | Плейлисты                     | —           | `listen.my-playlists` (`/listen`), `playlists.create` (`/listen/my-playlists`), «Добавить проповедь» (без цели) |
| `history`   | История прослушивания         | —           | `more.history-item` (`/more`), `history.rows` (`/history`), `history.header-menu`                     |
| `offline`   | Офлайн-режим                  | —           | `more.offline-item` (`/more`), `offline.caching-switch` (`/offline`), `offline.rows` (`/offline`), `offline.header-menu` |
| `settings`  | Настройки и резервные копии   | —           | `more.settings-item` (`/more`), `settings.theme` (`/settings`), `settings.haptics`, `settings.tours`, `settings.backup`, `settings.server` |
| `read`      | Читать книги                  | `read`      | «Библиотека книг» (`/read`), `read.notes`, `read.verse-by-verse`, `read.topical`                    |
| `study`     | Учиться                       | `study`     | `study.tabs` (`/study`), «Материалы» (без цели)                                                     |
| `welcome`   | Добро пожаловать              | авто        | «Добро пожаловать!» (`/listen`), `listen.sections`, `listen.search-toggle`, `listen.my-playlists`, `more.menu` (`/more`), `settings.theme` (`/settings`), `settings.tours` (`/settings`) |
| `whatsNew`  | Что нового                    | авто        | «Обзоры в приложении» (без цели), `settings.tours` (`/settings`)                                     |

**Сценарии многоэкранные**: маршрут шага вычисляет `resolveStepRoute` — собственный `route` шага, иначе ближайший предыдущий (шаг без `route` наследует экран). Оверлей выполняет `router.navigate(route)` при несовпадении `pathname` (`navigate` переиспользует записи стека, без дублирования). Пока роутер переходит, оверлей скрыт целиком (`isNavigatingToStep`) — видна настоящая анимация перехода; пока цель на новом экране не измерена, карточка скрыта (см. п. 8), поэтому переход не мигает; если цель так и не появилась, через `MISSING_TARGET_TIMEOUT_MS = 1200` мс карточка показывается по центру как текстовая. Перед переходом, если у шага есть `tapTargetId` с измеренным видимым rect, сначала мигает `TapIndicator` (см. «Симуляция нажатия»).

## Цели подсветки

### Регистрация rect'а

- **`OnboardingTarget`** (`ui/OnboardingTarget.tsx`) — обёртка `View` (`collapsable={false}`) вокруг подсвечиваемого элемента. Регистрирует `window`-rect через `measureInWindow`, пока активен тур (`useTargetMeasure`, `lib/useTargetMeasure.ts`): при старте тура измеряются **все** смонтированные цели (это нужно и для tap-подсказок, ссылающихся не на цель шага), а при смене активного шага цель перемеряется. `id` **опционален**: при `id === undefined` компонент отдаёт `children` «как есть» (фрагмент, без `View`, без подписки на навигацию и без измерений), поэтому его можно вешать безусловно.
- **`useOnboardingTargetRef`** (`lib/useOnboardingTargetRef.ts`) — для элементов, которые владеют собственным позиционированием (абсолютно спозиционированный мини-плеер): хук возвращает ref, который вешают прямо на узел, чтобы не вводить лишний `View` и не сломать layout. Используется в `CollapsedMiniPlayer` для `player.mini`.
- **Когда измеряем**: при старте тура и при активации/деактивации шага (через `MEASURE_DELAY_MS = 100` мс — дать layout устояться), на `onLayout` активной цели и на навигационном событии `transitionEnd` (нативный стек) — тур перемеряет цели после перехода на другой экран. Пустые rect'ы (`width`/`height` = 0) не регистрируются.
- **Где хранится**: `onboardingTargetRectsAtom` (`Record<id, rect>`); при старте тура очищается.

### Цель за пределами экрана

Цель может быть смонтирована, но прокручена за пределы вьюпорта (её `rect` лежит целиком ниже или выше экрана). Тогда:

- **Автоскролл к цели:** экран регистрирует свой основной скролл через `useTourScrollable` — ref-callback на `ScrollView`/`FlatList` (поддерживает оба API: `scrollTo` и `scrollToOffset`), который кладёт императивный `scrollTo` в модульный реестр `tourScrollable` (`lib/tourScrollable.ts`) на время монтирования экрана. Когда активная цель после замера оказывается вне вьюпорта (`isRectOutsideViewport` — цель не видна целиком: уходит за верх **или** за низ с учётом нижнего инсета), `useTargetAutoScroll` (`lib/useTargetAutoScroll.ts`, вызывается из `MeasuredTarget` в `OnboardingTarget`) один раз за активацию вызывает `scrollTo(scrollOffsetFor(rect, viewportHeight), animated = true)` — цель центрируется, прокрутка анимирована и работает в обе стороны — и планирует два повторных замера (`+300` / `+700` мс, не более). Гвард «один раз за активацию» сбрасывается при деактивации шага, поэтому возврат «Назад» к цели выше вьюпорта снова прокручивает вверх. Таймеры чистятся при деактивации и размонтировании; повторных скроллов и бесконечного цикла нет. Реестр заполняют `ListenScreen`, `ReadScreen`, `MoreScreen`, `SettingsScreen`, `HistoryScreen`, `OfflineScreen`.
- **Страховка:** если `rect` всё равно лежит целиком за пределами вьюпорта, оверлей (`OnboardingTourOverlay`) рендерит его как отсутствующий: дырка не вырезается, карточка показывается по центру **сразу** (без ожидания `MISSING_TARGET_TIMEOUT_MS` — rect зарегистрирован, режим ожидания не включается). Позиция карточки в любом случае клампится в видимую область окна (`computeTooltipLayout`), поэтому она не уезжает за экран.

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
| `tab.listen`               | `widgets/tab-bar/ui/CustomTabBar.tsx`                                     | таб «Слушать»                                           |
| `tab.read`                 | `widgets/tab-bar/ui/CustomTabBar.tsx`                                     | таб «Читать»                                            |
| `tab.study`                | `widgets/tab-bar/ui/CustomTabBar.tsx`                                     | таб «Учиться»                                           |
| `tab.more`                 | `widgets/tab-bar/ui/CustomTabBar.tsx`                                     | таб «Ещё»                                               |
| `listen.sections`          | `pages/listen/ui/DynamicSectionsSlider.tsx` (`onboardingTargetId`)        | вертикальный блок секций (первый раздел + «Продолжить») |
| `listen.search-toggle`     | `pages/listen/ui/ListenTopRow.tsx`                                        | кнопка-лупа поиска                                      |
| `listen.continue-listening` | `pages/listen/ui/ContinueListeningButton.tsx` (`onboardingTargetId`)     | кнопка «Продолжить прослушивание»                       |
| `listen.my-playlists`      | `pages/listen/ui/MyPlaylistsSlider.tsx` (`onboardingTargetId`)            | секция «Мои плейлисты»                                  |
| `player.mini`              | `widgets/expandable-player/ui/ExpandablePlayer/CollapsedMiniPlayer.tsx` (`useOnboardingTargetRef`) | мини-плеер (только когда есть загруженный трек)         |
| `more.menu`                | `pages/more/ui/MoreScreen.tsx`                                            | блок таба «Ещё» (список пунктов)                        |
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

1. **Новый сценарий**: добавить файл `lib/scenarioData/<id>.ts` с `OnboardingScenario`, зарегистрировать его в `lib/scenarios.ts` (в `scenarios` и `scenariosById`) и расширить union `OnboardingScenarioId`. Если сценарий должен появляться только по фича-флагу — указать `featureFlag`; если он должен запускаться автоматически при первом запуске / смене версии — указать `sinceVersion` и добавить решение в `lib/resolveAutoTour.ts` (такой сценарий остаётся доступен в пикере для ручного повтора, в конце списка).
2. **Новая цель**: если цель — переиспользуемый компонент, добавь ему опциональный проп `onboardingTargetId` и оберни им собственный корень (`<OnboardingTarget id={onboardingTargetId}>`). В остальных случаях оберни элемент в `<OnboardingTarget id='...'>` на call-site (или повесь ref из `useOnboardingTargetRef('...')` на само-позиционируемый узел). В любом варианте прописывается тот же `targetId` в шаге сценария. id — строковый, конвенция `<экран>.<элемент>`.
3. **Многоэкранный шаг**: указать `route` шага — `OnboardingTourOverlay` сам переведёт тур на этот экран через `router.navigate` (цель на нём должна быть обёрнута в `OnboardingTarget`). Шаг без `route` наследует экран ближайшего предыдущего шага (`resolveStepRoute`).
4. **Текстовый шаг без цели**: просто не указывать `targetId` — карточка отрисуется по центру.
5. **Tap-подсказка**: указать `tapTargetId` (id элемента, по которому тур «нажимает» при переходе на маршрут шага, напр. `tab.more` или строка меню) — оверлей мигнёт на нём перед навигацией (см. «Симуляция нажатия»).
6. **Интерактивный шаг**: указать `waitFor` (`sermonSelected` | `paused`) — «Далее» будет скрыта до выполнения действия, вместо неё подсказка «Выполните действие, чтобы продолжить».

## Архитектура

- Слайс `src/features/onboarding/`:
  - `model.ts` — атомы `onboardingTourAtom` (`{ scenarioId, stepIndex } | null`) и `onboardingTargetRectsAtom`; экшены `startOnboardingTour`, `goToNextOnboardingStep`, `goToPrevOnboardingStep`, `endOnboardingTour`, `registerOnboardingTargetRect`.
  - `lib/` — `scenarios.ts` + `scenarioData/*` (+ чистая `resolveStepRoute` — маршрут шага с наследованием), `useOnboardingScenarios` (гейт по флагам; авто-сценарии в списке, но последними), `useTargetMeasure`, `useOnboardingTargetRef`, `tooltipPosition` (чистая функция позиции карточки), `tourHole` (чистая `resolveTourHole` — дырка, режим ожидания и позиция карточки), `tourScrollable` (модульный реестр основного скролла + чистые `isRectOutsideViewport`/`scrollOffsetFor`), `useTourScrollable` (ref-callback для регистрации скролла: ScrollView/FlatList), `useTargetAutoScroll` (автоскролл к цели вне вьюпорта в обе стороны + два повторных замера), `useStepNavigation` (резолв маршрута шага, tap-фаза и гейтированная навигация), `useWaitForSatisfied` (условие интерактивного шага по атомам плеера), `resolveAutoTour` (чистая функция решения об автозапуске), `useAutoTours` (автозапуск welcome/whatsNew).
  - Настройка «Обзоры и подсказки» (`toursDisabledAtom`, `setToursDisabled`, `loadToursDisabled`) и ключ `tours_seen_version` (`TOURS_SEEN_VERSION_KEY`, `setToursSeenVersion`) живут в `shared/model/settings.ts` (рядом с виброоткликом) и входят в резервную копию; онбординг только читает атом/ключ и пишет версию.
  - `ui/` — `HelpHeaderButton`, `ScenarioPickerModal`, `OnboardingHelpRow`, `OnboardingTarget`, `OnboardingTourOverlay`, `TapIndicator`, `TourDim`, `TourTooltip`.
- **Публичное API** (`index.ts`, 7 экспортов): `HelpHeaderButton`, `OnboardingHelpRow`, `OnboardingTarget`, `OnboardingTourOverlay`, `useAutoTours`, `useOnboardingTargetRef`, `useTourScrollable`.
- **Почему overlay смонтирован в `_RootLayout`**: `OnboardingTourOverlay` — один на всё приложение, рендерится поверх любого экрана и модалок независимо от текущего маршрута (`app/_RootLayout.tsx`, рядом с `GlobalErrorDialog`/`GlobalConfirmDialog`). Поэтому тур переживает навигацию: оверлей не размонтируется при `router.navigate` на маршрут шага.
- **Стабильные module-level header-рендеры**: `headerRight` для под-экранов задаётся функциями, объявленными на уровне модуля (`renderHelp`, `renderSettingsHelpRow` в `_RootLayout.tsx`; `renderHelp` в `app/(tabs)/listen/_layout.tsx`). Это вынужденно: expo-router передаёт `options` в `navigation.setOptions` на каждый рендер, и свежая inline-функция каждый раз «меняет» опции → `setState` → ре-рендер → цикл «Maximum update depth exceeded». Module-level ссылки идентичны между рендерами и цикла не создают (та же причина, что у `renderHeaderBack`).

## Интеграция по экранам

- **Централизованно** — под-экраны корневого стека (`SUB_SCREENS`: `settings`, `history`, `offline`, `about`, `share`) получают «?» из `app/_RootLayout.tsx`: `headerRight: renderHelp`, а `settings` — `renderSettingsHelpRow` («?» + кебаб-меню настроек). Экраны стека «Слушать» (`search-results`, `playlist-list`) получают «?» из `screenOptions.headerRight` в `app/(tabs)/listen/_layout.tsx`.
- **Кастомный `headerRight` через `OnboardingHelpRow`** — экраны, у которых уже есть собственные кнопки в шапке, встраивают «?» в свой ряд: `history` (`HistoryHeaderMenu`), `offline` (тумблер + меню), `playlist` (`PlaylistHeaderMenu`), `my-playlists` (карандаш/«Сохранить»), `playlist-edit` (галочка «Сохранить»). `OnboardingHelpRow` рендерит «?» слева, затем `children`.
- **Безшапочные табы** (`listen`, `read`, `study`, `more`; `headerShown: false`) — «?» стоит в верхнем ряду экрана (in-flow), а не в нативной шапке: `ListenTopRow` (рядом с лупой и щитом админки), `MoreScreen` (рядом с кнопкой «В админ панель»), `ReadScreen`/`StudyScreen` (собственный `topRow` справа).

## Тесты

- `model.test.ts` — старт сбрасывает rect'ы и ставит первый шаг, регистрация/перезапись rect'а, клампы `next`/`prev` на границах, no-op без тура, `end` чистит тур и rect'ы.
- `lib/tooltipPosition.test.ts` — позиция карточки (над/под целью, центрирование без цели, кламп по низу окна, смещение центрирования и нижнего клампа на `bottomInset`, кламп позиции «над целью» при цели ниже сгиба, кламп центрированной карточки в коротком окне).
- `lib/tourScrollable.test.ts` — `isRectOutsideViewport` (полностью видим / ровно на границе / ниже сгиба / выше вьюпорта / учёт нижнего инсета) и `scrollOffsetFor` (центрирование цели, кламп в 0 у верха списка).
- `lib/useTourScrollable.test.tsx` — ref-callback регистрирует скролл и пробрасывает `scrollTo` (ScrollView) / `scrollToOffset` (FlatList) в узел, снимает регистрацию при detach.
- `lib/useOnboardingScenarios.test.ts` — `read`/`study` появляются только при включённых флагах; авто-сценарии (`welcome`/`whatsNew`) в пикере есть и идут последними.
- `lib/resolveAutoTour.test.ts` — нет версии → `welcome`, версия изменилась → `whatsNew`, версия совпала → `null`.
- `lib/useAutoTours.test.ts` — гейтинг автозапуска: при выключенных обзорах ничего не пишется; нет версии → `welcome` (версия пишется до старта тура); версия совпала → ничего; версия изменилась → `whatsNew`; уже активный тур → старт пропущен, но версия записана.
- `lib/scenarios.test.ts` — данные сценариев: у `welcome` 7 шагов (последний на `settings.tours`) и tap-подсказки на `tab.more`/`more.settings-item`; у `player` 3 шага с `waitFor` (`sermonSelected`/`paused`); tapTargetId у каждого сценария; у `whatsNew` задан `sinceVersion`; `resolveStepRoute` (свой route, наследование, `undefined`).
- `lib/useOnboardingTargetRef.test.tsx` — ref-цель измеряется только при совпадении с активным шагом.
- `lib/useWaitForSatisfied.test.tsx` — без `waitFor` всегда true; `sermonSelected`/`paused` считаются по атомам плеера (выбран трек, идёт воспроизведение).
- `ui/HelpHeaderButton.test.tsx` — «?» сразу открывает пикер (заголовок «Что посмотреть?» + первый сценарий), закрытие по backdrop; при `toursDisabledAtom = true` кнопка не рендерится.
- `src/shared/model/settings.test.ts` — `setToursDisabled` пишет значение и переключает атом, `loadToursDisabled` нормализует `'true'`/`'false'`/отсутствие ключа.
- `pages/settings/ui/ToursSettingsItem.test.tsx` — строка «Обзоры и подсказки» вызывает `setToursDisabled` с инвертированным значением.
- `ui/OnboardingTarget.test.tsx` — цель регистрирует rect при активном шаге; смонтированная неактивная цель регистрируется, пока идёт тур, и не регистрируется без тура; без `id` рендерит `children`; цель вне вьюпорта без скролла не падает; цель ниже и выше вьюпорта с зарегистрированным скроллом → `scrollTo` с вычисленным офсетом (`animated: true`) и повторный замер; полностью видимая цель не скроллит.
- `ui/TourTooltip.test.tsx` — интерактивный шаг (`waitFor`) с невыполненным условием скрывает «Далее» и показывает подсказку «Выполните действие, чтобы продолжить»; выполненное условие или отсутствие `waitFor` — кнопка «Далее».
- `ui/TapIndicator.test.tsx` — круг мигает тремя пульсами (`withRepeat(..., 3)`).
- `pages/more/ui/MoreMenuSettingsItem.test.tsx` — при заданном `onboardingTargetId` и активном шаге строка регистрирует свой rect; без пропа регистрации нет.
- `ui/OnboardingTourOverlay.test.tsx` — пусто без тура; шаг с целью и готовым rect (карточка + «Далее» + close); шаг без цели (карточка + «Назад»); «Готово» на последнем шаге; шаг с `route` → `router.navigate` вызывается с этим маршрутом при несовпадении `pathname`; пока `pathname` не совпадает с маршрутом — оверлей не рисуется; шаг с `tapTargetId` и измеренным rect → сначала `TapIndicator` без затемнения, затем `navigate` после tap-фазы; без rect — навигация сразу; завершение тура снимает tap-фазу; rect целиком ниже вьюпорта → карточка по центру показывается сразу; шаг с `targetId` без rect → карточка скрыта и появляется после истечения `MISSING_TARGET_TIMEOUT_MS`.

## Связанные документы

- [feature-flags.md](./feature-flags.md) — гейтинг сценариев `read`/`study`
- [navigation.md](./navigation.md) — маршруты и стеки
- [state.md](./state.md) — Reatom-паттерны
- [screens/listen.md](../screens/listen.md), [screens/settings.md](../screens/settings.md), [screens/history.md](../screens/history.md), [screens/offline.md](../screens/offline.md) — целевые экраны
- [contracts/storage.md](../contracts/storage.md) — ключи `tours_disabled` / `tours_seen_version`
- [features/settings-backup.md](./settings-backup.md) — бэкап настроек онбординга

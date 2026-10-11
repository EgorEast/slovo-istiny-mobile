import { createCtx } from '@reatom/framework'
import { act } from '@testing-library/react-native'
import { dynamicSectionsAtom, type SectionData } from 'entities/section'
import { renderWithProviders } from 'shared/mocks'
import { PlaylistListScreen } from './PlaylistListScreen'

const mockPush = jest.fn()
const mockParams: { sectionId?: string } = {}
const mockResolveSectionFromCache = jest.fn()

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('entities/section', () => {
  const { atom } = jest.requireActual('@reatom/framework')

  return {
    dynamicSectionsAtom: atom([], 'testDynamicSectionsAtom'),
  }
})

jest.mock('../lib/resolveSectionFromCache', () => ({
  resolveSectionFromCache: (...args: unknown[]) => mockResolveSectionFromCache(...args),
}))

// The list body (collapsing header, rows, separators, empty text) is covered by
// the widget's own test; here we stub it to the resolved title so the page test
// stays focused on section-resolution states.
jest.mock('widgets/playlist-list', () => {
  const { Text } = jest.requireActual('react-native')

  return {
    PlaylistList: ({ title }: { title: string }) => <Text>{title}</Text>,
  }
})

const SECTION_ID = 'section-1'
const SECTION_TITLE = 'Раздел проповедей'
const CACHED_SECTION_ID = 'cached-section'
const CACHED_SECTION_TITLE = 'Кэшированный раздел'
const SECTION_NOT_FOUND_TEXT = 'Секция не найдена'

const makeSection = (overrides: Partial<SectionData> = {}): SectionData => ({
  id: SECTION_ID,
  itemsSize: 'small',
  playlists: [],
  title: SECTION_TITLE,
  transform: 'short',
  ...overrides,
})

describe('<PlaylistListScreen>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockParams.sectionId = SECTION_ID
  })

  test('shows the not-found state when the section is missing after cache resolution', async () => {
    mockResolveSectionFromCache.mockResolvedValue(undefined)
    mockParams.sectionId = 'missing-section'

    const { findByText } = await renderWithProviders(<PlaylistListScreen />)

    expect(await findByText(SECTION_NOT_FOUND_TEXT)).toBeTruthy()
  })

  test('keeps the screen in a loading state while resolving the section from cache', async () => {
    let resolveCache!: (section?: SectionData) => void
    mockResolveSectionFromCache.mockReturnValue(
      new Promise(resolve => {
        resolveCache = resolve
      }),
    )
    mockParams.sectionId = CACHED_SECTION_ID

    const { container, queryByText } = await renderWithProviders(<PlaylistListScreen />)

    // RN 0.86 ActivityIndicator does not set accessibilityRole, so query the host element directly
    const spinner = container.queryAll(node => node.type === 'ActivityIndicator')
    expect(spinner).toHaveLength(1)
    expect(queryByText(SECTION_NOT_FOUND_TEXT)).toBeNull()

    await act(async () => {
      resolveCache(makeSection({ id: CACHED_SECTION_ID, title: CACHED_SECTION_TITLE }))
    })

    expect(queryByText(CACHED_SECTION_TITLE)).toBeTruthy()
  })

  test('renders the section resolved from cache when it is not in the atom', async () => {
    const cachedSection = makeSection({ id: CACHED_SECTION_ID, title: CACHED_SECTION_TITLE })
    mockResolveSectionFromCache.mockResolvedValue(cachedSection)
    mockParams.sectionId = CACHED_SECTION_ID

    const { findByText } = await renderWithProviders(<PlaylistListScreen />)

    expect(await findByText(CACHED_SECTION_TITLE)).toBeTruthy()
  })

  test('renders the section from the atom without a cache read', async () => {
    const ctx = createCtx()
    dynamicSectionsAtom(ctx, [makeSection()])

    const { findByText } = await renderWithProviders(<PlaylistListScreen />, { ctx })

    expect(await findByText(SECTION_TITLE)).toBeTruthy()
    expect(mockResolveSectionFromCache).not.toHaveBeenCalled()
  })
})

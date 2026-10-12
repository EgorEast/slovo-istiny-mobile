import { createCtx } from '@reatom/framework'
import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { useState } from 'react'
import { currentPlaylistAtom } from 'entities/player'
import { myPlaylistsAtom } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { renderWithProviders } from 'shared/mocks/renderWithProviders'
import { type createStyles } from '../ExpandablePlayer/styles'
import { PlayerMenuAnchor } from './PlayerMenuAnchor'

const mockTogglePlaylistSermon = jest.fn()

jest.mock('entities/player', () => {
  const { atom } = jest.requireActual('@reatom/framework')
  return {
    currentPlaylistAtom: atom(null, 'testCurrentPlaylistAtom'),
  }
})

jest.mock('entities/playlist', () => {
  const { atom } = jest.requireActual('@reatom/framework')
  return {
    myPlaylistsAtom: atom([], 'testMyPlaylistsAtom'),
    togglePlaylistSermon: (...args: unknown[]) => mockTogglePlaylistSermon(...args),
  }
})

jest.mock('../PlayerMenu/PlayerMenu', () => {
  const { Pressable: RNPressable, Text: RNText } = jest.requireActual('react-native')
  return {
    PlayerMenu: ({
      canRemoveFromPlaylist,
      onClose,
      onRequestRemoveFromPlaylist,
    }: {
      canRemoveFromPlaylist: boolean
      onClose: () => void
      onRequestRemoveFromPlaylist?: () => void
    }) =>
      canRemoveFromPlaylist && onRequestRemoveFromPlaylist ? (
        <RNPressable
          onPress={() => {
            onRequestRemoveFromPlaylist()
            onClose()
          }}
        >
          <RNText>Удалить из текущего плейлиста</RNText>
        </RNPressable>
      ) : null,
  }
})

const MENU_BUTTON_LABEL = 'Меню плеера'
const REMOVE_MENU_TEXT = 'Удалить из текущего плейлиста'
const REMOVE_DIALOG_TITLE = 'Удалить из плейлиста?'
const REMOVE_DIALOG_MESSAGE = 'Плеер будет закрыт.'
const CONFIRM_TEXT = 'Удалить'
const CANCEL_TEXT = 'Отмена'
const PLAYLIST_ID = 'custom-abcdef0123456789'

const MOCK_AUDIO: AudioPlayerData = {
  artist: 'Author',
  artwork: null,
  audioUrl: 'https://example.com/audio.mp3',
  id: 'sermon-1',
  title: 'Sermon',
}

const PLAYLIST = {
  artwork: null,
  id: PLAYLIST_ID,
  sermons: [MOCK_AUDIO],
  title: 'Плейлист',
}

const STYLES = {
  menuButton: {},
  menuContainer: {},
  menuIcon: {},
} as unknown as ReturnType<typeof createStyles>

const Harness = () => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <PlayerMenuAnchor
      styles={STYLES}
      audio={MOCK_AUDIO}
      visualState='cloud'
      showMenu={showMenu}
      setShowMenu={setShowMenu}
      onShowDetails={jest.fn()}
      onToggleCache={jest.fn()}
      onOpenSoundSettings={jest.fn()}
      onOpenMenu={() => setShowMenu(true)}
    />
  )
}

const renderAnchor = async ({ isLocal = true }: { isLocal?: boolean } = {}) => {
  const ctx = createCtx()
  currentPlaylistAtom(ctx, PLAYLIST)
  myPlaylistsAtom(ctx, isLocal ? [{ id: PLAYLIST_ID, sermonIds: [], sermons: [], title: 'П' }] : [])
  const utils = await renderWithProviders(<Harness />, { ctx })
  await act(async () => {
    fireEvent.press(utils.getByLabelText(MENU_BUTTON_LABEL))
  })
  return { ...utils, ctx }
}

describe('<PlayerMenuAnchor>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('hides the remove item when the current playlist is not local', async () => {
    const { queryByText } = await renderAnchor({ isLocal: false })

    expect(queryByText(REMOVE_MENU_TEXT)).toBeNull()
  })

  test('item press opens the confirmation and closes the menu', async () => {
    const { getByText, queryByText } = await renderAnchor()

    await act(async () => {
      fireEvent.press(getByText(REMOVE_MENU_TEXT))
    })
    await waitFor(() => expect(getByText(REMOVE_DIALOG_TITLE)).toBeTruthy())

    expect(getByText(REMOVE_DIALOG_MESSAGE)).toBeTruthy()
    expect(queryByText(REMOVE_MENU_TEXT)).toBeNull()
    expect(mockTogglePlaylistSermon).not.toHaveBeenCalled()
  })

  test('confirm removes the sermon', async () => {
    const { ctx, getByText } = await renderAnchor()

    await act(async () => {
      fireEvent.press(getByText(REMOVE_MENU_TEXT))
    })
    await waitFor(() => expect(getByText(CONFIRM_TEXT)).toBeTruthy())
    await act(async () => {
      fireEvent.press(getByText(CONFIRM_TEXT))
    })

    expect(mockTogglePlaylistSermon).toHaveBeenCalledWith(ctx, PLAYLIST_ID, MOCK_AUDIO, false)
  })

  test('cancel does not remove the sermon', async () => {
    const { getByText } = await renderAnchor()

    await act(async () => {
      fireEvent.press(getByText(REMOVE_MENU_TEXT))
    })
    await waitFor(() => expect(getByText(CANCEL_TEXT)).toBeTruthy())
    await act(async () => {
      fireEvent.press(getByText(CANCEL_TEXT))
    })

    expect(mockTogglePlaylistSermon).not.toHaveBeenCalled()
  })
})

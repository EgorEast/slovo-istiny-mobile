import { act, waitFor } from '@testing-library/react-native'
import { invidiousMocks } from 'shared/api/generated'
import { INPUT_LIMITS } from 'shared/lib/validation/inputLimits'
import { renderHookWithProviders } from 'shared/mocks'
import { toastAtom } from 'shared/model'
import { INSTANCE_LIMIT_MESSAGE, INSTANCE_TOO_LONG_MESSAGE } from './instanceUrl'
import { useInvidiousInstancesAdmin } from './useInvidiousInstancesAdmin'

const mockFindAll = jest.fn()
const mockReplace = jest.fn()

jest.mock('shared/api', () => ({
  invidiousApi: {
    getInvidious: () => ({
      invidiousInstancesControllerFindAll: mockFindAll,
      invidiousInstancesControllerReplace: mockReplace,
    }),
  },
}))

const createInstances = (urls: string[]) => {
  const template = invidiousMocks.getInvidiousInstancesControllerFindAllResponseMock()[0]

  return urls.map((url, index) => ({ ...template, id: index + 1, url }))
}

const buildUrls = (count: number) =>
  Array.from({ length: count }, (_, index) => `https://instance-${index}.example`)

describe('useInvidiousInstancesAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('does not save more instances than the server limit', async () => {
    mockFindAll.mockResolvedValue(createInstances(buildUrls(INPUT_LIMITS.invidious.urls)))

    const { ctx, result } = await renderHookWithProviders(() => useInvidiousInstancesAdmin())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addAndSave('https://new.example')
    })

    expect(ctx.get(toastAtom)).toBe(INSTANCE_LIMIT_MESSAGE)
    expect(mockReplace).not.toHaveBeenCalled()
  })

  test('does not save a url longer than the server limit', async () => {
    mockFindAll.mockResolvedValue(createInstances([]))

    const { ctx, result } = await renderHookWithProviders(() => useInvidiousInstancesAdmin())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const longUrl = `https://${'a'.repeat(INPUT_LIMITS.invidious.url)}.example`

    await act(async () => {
      await result.current.addAndSave(longUrl)
    })

    expect(ctx.get(toastAtom)).toBe(INSTANCE_TOO_LONG_MESSAGE)
    expect(mockReplace).not.toHaveBeenCalled()
  })
})

import { act } from '@testing-library/react-native'
import { usersMocks } from 'shared/api/generated'
import { renderHookWithProviders } from 'shared/mocks'
import { useUserFormController } from '../lib/useUserFormController'

const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockBack = jest.fn()

jest.mock('shared/api', () => ({
  usersApi: {
    getUsers: () => ({
      usersControllerCreate: mockCreate,
      usersControllerUpdate: mockUpdate,
    }),
  },
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}))

const EMAIL = 'new@test.ru'
const NAME = 'Новый'

const createInitial = () =>
  usersMocks.getUsersControllerFindOneResponseMock({
    email: 'old@test.ru',
    id: 'u1',
    name: 'Старое имя',
    role: 'moderator',
    username: 'oldlogin',
  })

describe('useUserFormController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.mockResolvedValue(usersMocks.getUsersControllerCreateResponseMock())
    mockUpdate.mockResolvedValue(usersMocks.getUsersControllerUpdateResponseMock())
  })

  test('create sends the full payload including role', async () => {
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ mode: 'create' }),
    )

    await act(async () => {
      result.current.onChange('name', NAME)
      result.current.onChange('email', EMAIL)
      result.current.onChange('username', 'newlogin')
      result.current.onChange('password', 'secret123')
      result.current.onChange('role', 'admin')
    })
    await act(async () => {
      await result.current.save()
    })

    expect(mockCreate).toHaveBeenCalledWith({
      email: EMAIL,
      name: NAME,
      password: 'secret123',
      role: 'admin',
      username: 'newlogin',
    })
    expect(mockBack).toHaveBeenCalled()
  })

  test('create blocks a password shorter than 8 characters', async () => {
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ mode: 'create' }),
    )

    await act(async () => {
      result.current.onChange('name', NAME)
      result.current.onChange('email', EMAIL)
      result.current.onChange('username', 'newlogin')
      result.current.onChange('password', 'short')
    })
    await act(async () => {
      await result.current.save()
    })

    expect(mockCreate).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Пароль должен содержать минимум 8 символов.')
  })

  test('create blocks a password longer than 200 characters', async () => {
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ mode: 'create' }),
    )

    await act(async () => {
      result.current.onChange('name', NAME)
      result.current.onChange('email', EMAIL)
      result.current.onChange('username', 'newlogin')
      result.current.onChange('password', 'a'.repeat(201))
    })
    await act(async () => {
      await result.current.save()
    })

    expect(mockCreate).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Пароль должен содержать не более 200 символов.')
  })

  test('create blocks submission while required fields are empty', async () => {
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ mode: 'create' }),
    )

    await act(async () => {
      await result.current.save()
    })

    expect(mockCreate).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Заполните все поля.')
  })

  test('create is pristine until the first input', async () => {
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ mode: 'create' }),
    )

    expect(result.current.isDirty).toBe(false)

    await act(async () => {
      result.current.onChange('name', 'Новое')
    })

    expect(result.current.isDirty).toBe(true)
  })

  test('edit is pristine while untouched and dirty after a change', async () => {
    const initial = createInitial()
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ id: 'u1', initial, mode: 'edit' }),
    )

    expect(result.current.isDirty).toBe(false)

    await act(async () => {
      result.current.onChange('name', 'Новое имя')
    })

    expect(result.current.isDirty).toBe(true)
  })

  test('edit sends only the changed fields (no password)', async () => {
    const initial = createInitial()
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ id: 'u1', initial, mode: 'edit' }),
    )

    await act(async () => {
      result.current.onChange('name', 'Новое имя')
      result.current.onChange('role', 'admin')
    })
    await act(async () => {
      await result.current.save()
    })

    expect(mockUpdate).toHaveBeenCalledWith('u1', { name: 'Новое имя', role: 'admin' })
    expect(mockUpdate.mock.calls[0][1]).not.toHaveProperty('email')
    expect(mockUpdate.mock.calls[0][1]).not.toHaveProperty('username')
  })

  test('edit blocks a changed field longer than its limit', async () => {
    const initial = createInitial()
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ id: 'u1', initial, mode: 'edit' }),
    )

    await act(async () => {
      result.current.onChange('name', 'a'.repeat(101))
    })
    await act(async () => {
      await result.current.save()
    })

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Имя: не более 100 символов.')
  })

  test('edit navigates back without a request when nothing changed', async () => {
    const initial = createInitial()
    const { result } = await renderHookWithProviders(() =>
      useUserFormController({ id: 'u1', initial, mode: 'edit' }),
    )

    await act(async () => {
      await result.current.save()
    })

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockBack).toHaveBeenCalled()
  })
})

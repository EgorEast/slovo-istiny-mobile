import { applyWebUpdate } from './applyWebUpdate'

const SKIP_WAITING_MESSAGE = { type: 'SKIP_WAITING' }
const APPLY_TIMEOUT_MS = 15_000

interface ServiceWorkerContainerMock {
  addEventListener: jest.Mock
  ready: Promise<ServiceWorkerRegistration>
}

const createWaitingWorker = () => ({ postMessage: jest.fn() })

const mockServiceWorkerContainer = (waiting: { postMessage: jest.Mock } | null) => {
  const registration = { waiting } as unknown as ServiceWorkerRegistration
  const container: ServiceWorkerContainerMock = {
    addEventListener: jest.fn(),
    ready: Promise.resolve(registration),
  }
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: container,
  })
  return container
}

const mockReload = () => {
  const reload = jest.fn()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload },
  })
  return reload
}

const getControllerChangeHandler = (container: ServiceWorkerContainerMock) => {
  const call = container.addEventListener.mock.calls.find(([type]) => type === 'controllerchange')
  return call?.[1] as (() => void) | undefined
}

describe('applyWebUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('posts SKIP_WAITING to the waiting worker and reloads once on controllerchange', async () => {
    const waiting = createWaitingWorker()
    const container = mockServiceWorkerContainer(waiting)
    const reload = mockReload()

    await applyWebUpdate()

    expect(waiting.postMessage).toHaveBeenCalledWith(SKIP_WAITING_MESSAGE)
    expect(reload).not.toHaveBeenCalled()

    const controllerChangeHandler = getControllerChangeHandler(container)
    expect(controllerChangeHandler).toBeDefined()

    controllerChangeHandler?.()
    controllerChangeHandler?.()

    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('reloads directly when no waiting worker exists', async () => {
    const container = mockServiceWorkerContainer(null)
    const reload = mockReload()

    await applyWebUpdate()

    expect(reload).toHaveBeenCalledTimes(1)
    expect(container.addEventListener).not.toHaveBeenCalled()
  })

  describe('safety timeout', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('does not reload again from the safety timer after controllerchange reloads', async () => {
      const waiting = createWaitingWorker()
      const container = mockServiceWorkerContainer(waiting)
      const reload = mockReload()

      await applyWebUpdate()

      const controllerChangeHandler = getControllerChangeHandler(container)
      controllerChangeHandler?.()
      expect(reload).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(APPLY_TIMEOUT_MS)

      expect(reload).toHaveBeenCalledTimes(1)
    })

    test('reloads from the safety timer when controllerchange never fires', async () => {
      const waiting = createWaitingWorker()
      mockServiceWorkerContainer(waiting)
      const reload = mockReload()

      await applyWebUpdate()
      expect(reload).not.toHaveBeenCalled()

      jest.advanceTimersByTime(APPLY_TIMEOUT_MS)

      expect(reload).toHaveBeenCalledTimes(1)
    })
  })
})

import { View } from 'react-native'

type MeasureInWindowCallback = (x: number, y: number, width: number, height: number) => void

// `View` is a function component, so `View.prototype` is untyped and jest infers
// the spied method as `(...args: unknown[]) => any`. These casts restore the host
// instance signatures; test mocks then receive typed callbacks.
interface MeasureInWindowHost {
  measureInWindow: (callback: MeasureInWindowCallback) => void
}

type MeasureLayoutCallback = (x: number, y: number, width: number, height: number) => void

interface MeasureLayoutHost {
  measureLayout: (
    relativeToNativeNode: unknown,
    onSuccess: MeasureLayoutCallback,
    onFail?: () => void,
  ) => void
}

interface Rect {
  height: number
  width: number
  x: number
  y: number
}

export const spyOnMeasureInWindow = () =>
  jest.spyOn(View.prototype as unknown as MeasureInWindowHost, 'measureInWindow')

export const spyOnMeasureLayout = () =>
  jest.spyOn(View.prototype as unknown as MeasureLayoutHost, 'measureLayout')

export const mockMeasureInWindow = (rect: Rect) => {
  const spy = spyOnMeasureInWindow()

  spy.mockImplementation(callback => {
    callback(rect.x, rect.y, rect.width, rect.height)
  })

  return spy
}

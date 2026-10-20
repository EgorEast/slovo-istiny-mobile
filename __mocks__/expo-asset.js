// Under jest-expo the numeric module id returned by `require('*.ttf')` is not
// registered in the native asset registry (SDK 58), so the real `Asset.fromModule`
// throws `Module "1" is missing from the asset registry`. Tests only need a
// benign, already-downloaded asset, so every module resolves to the same stub.
// Tests that need distinct assets per module must override this mock locally.
jest.mock('expo-asset', () => {
  class Asset {
    constructor() {
      this.downloaded = true
      this.hash = null
      this.height = 0
      this.localUri = 'file://mock-asset'
      this.name = 'mock'
      this.type = 'ttf'
      this.uri = 'file://mock-asset'
      this.width = 0
    }

    async downloadAsync() {
      return this
    }
  }

  const createMockAsset = () => new Asset()

  Asset.fromMetadata = jest.fn(createMockAsset)
  Asset.fromModule = jest.fn(createMockAsset)
  Asset.fromURI = jest.fn(createMockAsset)
  Asset.loadAsync = jest.fn(async () => [createMockAsset()])

  return { __esModule: true, Asset }
})

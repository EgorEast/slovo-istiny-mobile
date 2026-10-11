jest.mock('expo-blur', () => {
  const { View } = require('react-native')

  return { BlurTargetView: View, BlurView: View }
})

import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Platform } from 'react-native'

// Workaround for react-native-screens#3130: on Fabric the focused EditText is
// missing from the Android autofill AssistStructure until the view subtree is
// rebuilt after navigation. Remounting the inputs via a changed key on focus
// restores autofill suggestions. `requestIdleCallback` (a forced replacement —
// InteractionManager was removed in RN 0.88) fires when the JS thread is idle,
// which does NOT guarantee the Fabric transition finished (it runs off the JS
// thread). If rn-screens#3130 resurfaces, this timing is suspect #1.
export const useAndroidAutofillRemountKey = () => {
  const [key, setKey] = useState(0)

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return

      const idleHandle = requestIdleCallback(() => {
        setKey(currentKey => currentKey + 1)
      })

      return () => cancelIdleCallback(idleHandle)
    }, []),
  )

  return key
}

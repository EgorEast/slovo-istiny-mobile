import { StyleSheet } from 'react-native'
import { APP_MAX_CONTENT_WIDTH } from 'shared/ui/layout'
import { INDENTS } from 'shared/ui/theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tooltip: {
    // Desktop-web: cap the card to the shared centered column (undefined on native,
    // so phones keep the full width between the margins).
    alignSelf: 'center',
    maxWidth: APP_MAX_CONTENT_WIDTH,
    width: '100%',
  },
  tooltipAnchor: {
    left: INDENTS.high,
    position: 'absolute',
    right: INDENTS.high,
  },
})

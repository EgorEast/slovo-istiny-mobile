import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'
import { type APITypes } from 'shared/api'
import { useTheme } from 'shared/ui/theme'
import { PlaylistDetailHeader } from './PlaylistDetailHeader'
import { PlaylistDetailSectionRow } from './PlaylistDetailSectionRow'
import { PlaylistSermonsMenu } from './PlaylistSermonsMenu'
import { styles } from './styles'

// Шапка списка детали плейлиста: герой, блок разделов и заголовок проповедей
// с меню действий над списком. Вынесена из экрана ради лимита строк.
export const PlaylistDetailListHeader = ({
  playlist,
  refresh,
  sermons,
}: {
  playlist: APITypes.PlaylistEntity
  refresh: () => Promise<void>
  sermons: APITypes.PlaylistSermon[]
}) => {
  const router = useRouter()
  const { currentTheme } = useTheme()

  return (
    <View>
      <PlaylistDetailHeader playlist={playlist} sermonsCount={sermons.length} />
      {playlist.sections.length > 0 ? (
        <>
          <Text style={[styles.sermonsTitle, { color: currentTheme.text }]}>
            {`Разделы (${playlist.sections.length})`}
          </Text>
          {playlist.sections.map(section => (
            <PlaylistDetailSectionRow
              key={section.id}
              section={section}
              onPress={() =>
                router.push({ params: { id: section.id }, pathname: '/admin/sections/[id]' })
              }
            />
          ))}
        </>
      ) : null}
      <View style={styles.sermonsHeaderRow}>
        <Text style={[styles.sermonsHeaderTitle, { color: currentTheme.text }]}>
          {`Проповеди плейлиста (${sermons.length})`}
        </Text>
        {sermons.length > 0 ? (
          <PlaylistSermonsMenu refresh={refresh} sermons={sermons} playlist={playlist} />
        ) : null}
      </View>
    </View>
  )
}

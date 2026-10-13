import { EdgeSeekZone } from './EdgeSeekZone'
import { type SeekDirection } from './keyboardTargetGuards'
import { useEdgeTapSeek } from './useEdgeTapSeek'

export const PlayerEdgeSeekZones = ({
  startSeek,
  stopSeek,
  tapSeek,
}: {
  startSeek: (direction: SeekDirection) => void
  stopSeek: () => void
  tapSeek: (direction: SeekDirection) => void
}) => {
  const { handleEdgeTap } = useEdgeTapSeek(tapSeek)

  return (
    <>
      <EdgeSeekZone
        direction='backward'
        onHoldEnd={stopSeek}
        onHoldStart={startSeek}
        onTapEdge={handleEdgeTap}
        targetId='player-fullscreen.edge-back'
      />
      <EdgeSeekZone
        direction='forward'
        onHoldEnd={stopSeek}
        onHoldStart={startSeek}
        onTapEdge={handleEdgeTap}
        targetId='player-fullscreen.edge-forward'
      />
    </>
  )
}

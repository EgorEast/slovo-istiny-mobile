import { StyleSheet } from 'react-native'
import Svg, { Mask, Rect } from 'react-native-svg'
import { type OnboardingTargetRect } from '../model'

const MASK_ID = 'onboarding-tour-mask'
const HOLE_PADDING = 8
const HOLE_RADIUS = 12
const DIM_COLOR = 'rgba(0,0,0,0.75)'

export const TourDim = ({
  height,
  hole,
  width,
}: {
  height: number
  hole: null | OnboardingTargetRect
  width: number
}) => (
  <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
    <Mask id={MASK_ID}>
      <Rect x={0} y={0} fill='white' width={width} height={height} />
      {hole ? (
        <Rect
          fill='black'
          rx={HOLE_RADIUS}
          x={hole.x - HOLE_PADDING}
          y={hole.y - HOLE_PADDING}
          width={hole.width + HOLE_PADDING * 2}
          height={hole.height + HOLE_PADDING * 2}
        />
      ) : null}
    </Mask>
    <Rect x={0} y={0} width={width} height={height} fill={DIM_COLOR} mask={`url(#${MASK_ID})`} />
  </Svg>
)

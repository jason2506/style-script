import directions from './utils/directions'
import xy from './xy'

const stringify = directions(
  'corners',
  'topLeftAndBottomRight', 'topRightAndBottomLeft',
  'topLeft', 'topRight', 'bottomRight', 'bottomLeft'
)

export default (cornersX, cornersY) => (
  cornersY
    ? xy(stringify(cornersX), stringify(cornersY), '/')
    : stringify(cornersX)
)

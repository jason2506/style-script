export default (x, y, seperator = ' ') => (
  y && y !== x
    ? `${x}${seperator}${y}`
    : x.toString()
)

const defaultUnits = {
  'width': 'px',
  'min-width': 'px',
  'max-width': 'px',
  'height': 'px',
  'min-height': 'px',
  'max-height': 'px',

  'device-width': 'px', // deprecated in CSS4
  'min-device-width': 'px', // deprecated in CSS4
  'max-device-width': 'px', // deprecated in CSS4
  'device-height': 'px', // deprecated in CSS4
  'min-device-height': 'px', // deprecated in CSS4
  'max-device-height': 'px', // deprecated in CSS4
}

const hasOwnProperty = Object.prototype.hasOwnProperty
const proto = {
  toString() {
    const {
      _modifier: modifier,
      _type: type,
      _features: features,
    } = this

    const conds = []
    if (modifier) {
      conds.push(`${modifier} ${type}`)
    } else if (type !== 'all') {
      conds.push(type)
    }

    Object.keys(features)
      .forEach(feature => {
        const name = feature.replace(/([A-Z])/g, '-$1').toLowerCase()
        const value = features[feature]
        if (value === true) {
          conds.push(`(${name})`)
        } else if (value !== false) {
          const unit = typeof value === 'number' && value !== 0 &&
            hasOwnProperty.call(defaultUnits, name)
              ? defaultUnits[name]
              : ''
          conds.push(`(${name}: ${value}${unit})`)
        }
      })

    return conds.join(' and ')
  },
}

export default ({ modifier = null, type = 'all', features = {} } = {}) => {
  const media = Object.create(proto)
  media._modifier = modifier
  media._type = type
  media._features = features
  return media
}

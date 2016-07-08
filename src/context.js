import _ from 'lodash'

const toArray = items => (
  items
    ? Array.isArray(items) ? items : [items]
    : []
)

const proto = Object.freeze({
  resolve() {
    const context = this.context
    const selectors = this.selectors
    const resolved = context
      ? typeof selectors === 'function'
        ? _.flatMap(
            context.resolve(),
            contextSelector => toArray(
              selectors(contextSelector)
            )
          )
        : _.flatMap(
            context.resolve(),
            contextSelector =>
              toArray(selectors)
                .map(selector => `${ contextSelector } ${ selector }`)
          )
      : toArray(selectors)

    return resolved
  },

  toString() {
    return this.resolve().join(',')
  },
})

export default (selectors, context) =>
  Object.create(proto, {
    selectors: {
      writable: false,
      configurable: false,
      value: selectors,
    },

    context: {
      writable: false,
      configurable: false,
      value: context,
    },
  })

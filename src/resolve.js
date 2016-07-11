import _ from 'lodash'

const toArray = items => (
  items
    ? Array.isArray(items) ? items : [items]
    : []
)

export default (selectors, context) => {
  const resolved = context
    ? typeof selectors === 'function'
      ? _.flatMap(
          context,
          contextSelector => toArray(
            selectors(contextSelector)
          )
        )
      : _.flatMap(
          context,
          contextSelector =>
            toArray(selectors)
              .map(selector => `${ contextSelector } ${ selector }`)
        )
    : toArray(selectors)

  return resolved
}

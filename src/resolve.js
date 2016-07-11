const toArray = items => (
  items
    ? Array.isArray(items) ? items : [items]
    : []
)

export default (selectors, context) => {
  if (!context) {
    return toArray(selectors)
  }

  const resolved = []
  if (typeof selectors === 'function') {
    context.forEach(contextSelector => {
      toArray(
        selectors(contextSelector)
      )
        .forEach(selector => {
          resolved.push(selector)
        })
    })
  } else {
    selectors = toArray(selectors)
    context.forEach(contextSelector => {
      selectors.forEach(selector => {
        resolved.push(`${ contextSelector } ${ selector }`)
      })
    })
  }

  return resolved
}

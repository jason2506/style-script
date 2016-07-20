const toArray = items => (
  items
    ? Array.isArray(items) ? items : [items]
    : []
)

export default (selectors, context) => {
  selectors = toArray(selectors)
  if (!context) {
    return selectors
  }

  const resolved = []
  context.forEach(contextSelector => {
    selectors.forEach(selector => {
      if (typeof selector === 'function') {
        toArray(
          selector(contextSelector)
        )
          .forEach(result => {
            resolved.push(result)
          })
      } else {
        resolved.push(`${contextSelector} ${selector}`)
      }
    })
  })

  return resolved
}

const hasOwnProperty = Object.prototype.hasOwnProperty
const increase = val => val + 1

export const updateWithDefault = (map, key, init, update) => {
  map[key] = update(hasOwnProperty.call(map, key) ? map[key] : init)
}

export const getCounts = (lists, parentCounts, childCounts) => {
  lists.forEach(items => {
    let parent = null
    items.forEach(item => {
      if (parent) {
        updateWithDefault(parentCounts, item, 0, increase)
        updateWithDefault(childCounts, parent, {},
          counts => {
            updateWithDefault(counts, item, 0, increase)
            return counts
          }
        )
      } else if (!hasOwnProperty.call(parentCounts, item)) {
        parentCounts[item] = 0
      }

      parent = item
    })
  })
}

export default lists => {
  const parentCounts = {}
  const childCounts = {}
  getCounts(lists, parentCounts, childCounts)

  const result = []
  const candidates = []
  const items = Object.keys(parentCounts)
  items.forEach(child => {
    if (parentCounts[child] === 0) {
      candidates.push(child)
    }
  })

  while (candidates.length) {
    const item = candidates.shift()
    result.push(item)

    const counts = childCounts[item] || {}
    Object.keys(counts)
      .forEach(child => {
        parentCounts[child] -= counts[child]
        if (parentCounts[child] === 0) {
          candidates.push(child)
        }
      })
  }

  if (result.length !== items.length) {
    throw new Error('There is no solution for the merge operation')
  }

  return result
}

const hasOwnProperty = Object.hasOwnProperty
const get = (sides, has, name, fallback) =>
  (has(name) ? sides[name] : fallback)

export const toArray = arrOrObj => {
  if (Array.isArray(arrOrObj)) {
    return arrOrObj
  } else if (typeof arrOrObj !== 'object' || arrOrObj === null) {
    throw new Error(`${arrOrObj} is not a valid value for sides`)
  }

  const sides = []
  const has = hasOwnProperty.bind(arrOrObj)
  const all = arrOrObj.all

  const vertical = get(arrOrObj, has, 'vertical', all)
  const horizontal = get(arrOrObj, has, 'horizontal', all)

  sides.push(get(arrOrObj, has, 'top', vertical))
  sides.push(get(arrOrObj, has, 'right', horizontal))
  sides.push(get(arrOrObj, has, 'bottom', vertical))
  sides.push(get(arrOrObj, has, 'left', horizontal))

  return sides
}

export const normalize = sides => {
  const n = sides.length
  if (n > 3 && sides[3] !== sides[1]) {
    return sides.slice(0, 4)
  } else if (n > 2 && sides[2] !== sides[0]) {
    return sides.slice(0, 3)
  } else if (n > 1 && sides[1] !== sides[0]) {
    return sides.slice(0, 2)
  } else {
    return sides.slice(0, 1)
  }
}

export default sides => normalize(toArray(sides)).join(' ')

const hasOwnProperty = Object.hasOwnProperty
const get = (directions, has, name, fallback) =>
  (has(name) ? directions[name] : fallback)

export const toArray = (
  name,
  firstAndThird, secondAndFourth,
  first, second, third, fourth
) => arrOrObj => {
  if (Array.isArray(arrOrObj)) {
    return arrOrObj
  } else if (typeof arrOrObj !== 'object' || arrOrObj === null) {
    throw new Error(`${arrOrObj} is not a valid value for ${name}`)
  }

  const directions = []
  const has = hasOwnProperty.bind(arrOrObj)
  const all = arrOrObj.all

  const valFirstAndThird = get(arrOrObj, has, firstAndThird, all)
  const valSecondAndFourth = get(arrOrObj, has, secondAndFourth, all)

  directions.push(get(arrOrObj, has, first, valFirstAndThird))
  directions.push(get(arrOrObj, has, second, valSecondAndFourth))
  directions.push(get(arrOrObj, has, third, valFirstAndThird))
  directions.push(get(arrOrObj, has, fourth, valSecondAndFourth))

  return directions
}

export const normalize = directions => {
  const n = directions.length
  if (n > 3 && directions[3] !== directions[1]) {
    return directions.slice(0, 4)
  } else if (n > 2 && directions[2] !== directions[0]) {
    return directions.slice(0, 3)
  } else if (n > 1 && directions[1] !== directions[0]) {
    return directions.slice(0, 2)
  } else {
    return directions.slice(0, 1)
  }
}

export default (...args) => {
  const _toArray = toArray(...args)
  return directions => normalize(_toArray(directions)).join(' ')
}

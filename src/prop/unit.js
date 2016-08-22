const pattern = /^\s*([-+]?[0-9]+|[-+]?[0-9]*\.[0-9]+)([a-z]+|%)\s*$/i
const withUnit = unit => n => (unit && n !== 0 ? `${n}${unit}` : '0')

export const parse = value => {
  if (Number.isFinite(value)) {
    return { unit: null, value }
  }

  const matches = value.toString().match(pattern)
  if (!matches) {
    throw new Error(`${value} is not a valid value`)
  }

  return {
    unit: matches[2],
    value: parseFloat(matches[1]),
  }
}

export const additiveOp = op => (x, y) => {
  const { unit: unitX, value: valueX } = parse(x)
  const { unit: unitY, value: valueY } = parse(y)
  if (unitX !== unitY && valueX !== 0 && valueY !== 0) {
    throw new Error(`Incompatible units: "${unitX}" and "${unitY}"`)
  }

  return withUnit(unitX)(op(valueX, valueY))
}

export const multiplicativeOp = op => (x, n) => {
  const { unit, value } = parse(x)
  return withUnit(unit)(op(value, n))
}

export const ops = {
  add: additiveOp((a, b) => a + b),
  sub: additiveOp((a, b) => a - b),
  mul: multiplicativeOp((a, b) => a * b),
  div: multiplicativeOp((a, b) => a / b),
  mod: multiplicativeOp((a, b) => a % b),
}

export const units = {
  // <angle> units
  deg: withUnit('deg'),
  grad: withUnit('grad'),
  rad: withUnit('rad'),
  turn: withUnit('turn'),

  // relative <length> units
  em: withUnit('em'),
  ex: withUnit('ex'),
  ch: withUnit('ch'),
  rem: withUnit('rem'),

  // viewport-percentage <length> units
  vh: withUnit('vh'),
  vw: withUnit('vw'),
  vmin: withUnit('vmin'),
  vmax: withUnit('vmax'),

  // absolute <length> units
  px: withUnit('px'),
  mm: withUnit('mm'),
  q: withUnit('q'),
  cm: withUnit('cm'),
  in: withUnit('in'),
  pt: withUnit('pt'),
  pc: withUnit('pc'),

  // <percentage>
  percentage: withUnit('%'),

  // <resolution> units
  dpi: withUnit('dpi'),
  dpcm: withUnit('dpcm'),
  dppx: withUnit('dppx'),

  // <time> units
  s: withUnit('s'),
  ms: withUnit('ms'),
}

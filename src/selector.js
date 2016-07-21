const formatAttrValue = value => JSON.stringify(value.toString())

const $ = {
  // combinators
  descendant: selector => `>>${selector}`,
  child: selector => `>${selector}`,
  nextSibling: selector => `+${selector}`,
  followingSibling: selector => `~${selector}`,

  // attribute
  attr: name => `[${name}]`,
  attrOp: (name, op, value, { ignoreCase = false } = {}) =>
    `[${name}${op}${formatAttrValue(value)}${ignoreCase ? ' i' : ''}]`,
  attrEquals: (name, value, opts) => $.attrOp(name, '=', value, opts),
  attrContains: (name, value, opts) => $.attrOp(name, '*=', value, opts),
  attrContainsWord: (name, value, opts) => $.attrOp(name, '~=', value, opts),
  attrContainsPrefix: (name, value, opts) => $.attrOp(name, '|=', value, opts),
  attrStartsWith: (name, value, opts) => $.attrOp(name, '^=', value, opts),
  attrEndsWith: (name, value, opts) => $.attrOp(name, '$=', value, opts),

  // pseudo-elements
  before: '::before',
  after: '::after',
  firstLine: '::first-line',
  firstLetter: '::first-letter',

  // logical combinations
  not: selectors => `:not(${selectors})`,
  matches: selectors => `:matches(${selectors})`,
  has: selectors => `:has(${selectors})`,

  // location pseudo-classes
  anyLink: ':any-link',
  link: ':link',
  visited: ':visited',
  localLink: ':local-link',
  target: ':target',
  scope: ':scope',

  // user action pseudo-classes
  hover: ':hover',
  active: ':active',
  focus: ':focus',
  drop: (...filters) => `:drop(${filters.join(' ')}`,

  // time-dimensional pseudo-classes
  current: ':current',
  currentMatches: selectors => `:current(${selectors})`,
  past: ':past',
  future: ':future',

  // linguistic pseudo-classes
  dir: ltr => `:dir(${ltr})`,
  lang: (...langRanges) => `:lang(${langRanges})`,

  // the input pseudo-classes
  enabled: ':enabled',
  disabled: ':disabled',
  readWrite: ':read-write',
  readOnly: ':read-only',
  placeholderShown: ':placeholder-shown',
  defaultOption: ':default',
  checked: ':checked',
  indeterminate: ':indeterminate',
  valid: ':valid',
  invalid: ':invalid',
  inRange: ':in-range',
  outOfRange: ':out-of-range',
  required: ':required',
  optional: ':optional',
  userError: ':user-error',

  // tree-structural pseudo-classes
  empty: ':empty',
  blank: ':blank',
  nthChild: (n, selectors) => `:nth-child(${n}${selectors ? ` of ${selectors}` : ''})`,
  nthLastChild: (n, selectors) => `:nth-last-child(${n}${selectors ? ` of ${selectors}` : ''})`,
  firstChild: ':first-child',
  lastChild: ':last-child',
  onlyChild: ':only-child',
  nthOfType: n => `:nth-of-type(${n})`,
  nthLastOfType: n => `:nth-last-of-type(${n})`,
  firstOfType: ':first-of-type',
  lastOfType: ':last-of-type',
  onlyOfType: ':only-of-type',
  nthMatch: (n, selectors) => `:nth-match(${n} of ${selectors})`,
  nthLastMatch: (n, selectors) => `:nth-last-match(${n} of ${selectors})`,

  // grid-structural selectors
  column: selector => `||${selector}`,
  nthColumn: n => `:nth-column(${n})`,
  nthLastColumn: n => `:nth-last-column(${n})`,
}

$._ = _ => _

Object.keys($)
  .forEach(key => {
    const selector = $[key]
    $._[key] = (typeof selector === 'function')
      ? (...args) => _ => `${_}${selector(...args)}`
      : _ => `${_}${selector}`
  })

// additional selector combinations
Object.assign($._, {
  prepend: before => _ => `${before}${_}`,
  append: after => _ => `${_}${after}`,
  surroundWith: (before, after) => _ => `${before}${_}${after}`,

  // logical combinations
  notSelf: _ => $.not(_),
  matchesSelf: _ => $.matches(_),
  hasSelf: _ => $.has(_),

  // time-dimensional pseudo-classes
  currentOfSelf: _ => $.currentMatches(_),

  // tree-structural pseudo-classes
  nthChildOfSelf: n => _ => $.nthChild(n, _),
  nthLastChildOfSelf: n => _ => $.nthLastChild(n, _),
  nthMatchOfSelf: n => _ => $.nthMatch(n, _),
  nthLastMatchOfSelf: n => _ => $.nthLastMatch(n, _),
})

export default $

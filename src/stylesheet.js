import Decl from './decl'

const proto = Object.freeze({
  addRule(selector, decl) {
    this.root.nest(selector, decl)
    return this
  },

  export() {
    return this.root.export(null)
  },
})

export default () =>
  Object.create(proto, {
    root: {
      writable: false,
      configurable: false,
      value: Decl(),
    },
  })

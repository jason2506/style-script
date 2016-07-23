import Decl from './decl'

const proto = Object.freeze({
  addRule(selector, decl) {
    this._root.nest(selector, decl)
    return this
  },

  export() {
    return this._root.export(null)
  },
})

export default () => {
  const styles = Object.create(proto)
  styles._root = Decl()
  return styles
}

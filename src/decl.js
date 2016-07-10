import _ from 'lodash'

import Context from './context'
import merge from './merge'

const hasOwnProperty = Object.prototype.hasOwnProperty
const proto = Object.freeze({
  mixin(decl) {
    this.mixins.push(decl)
    return this
  },

  nest(selector, decl) {
    this.children.push({selector, decl})
    return this
  },

  _export(context, lists, rules) {
    const appended = !rules
    if (appended) {
      rules = {}
    }

    const {mixins, props, children} = this
    if (context) {
      if (hasOwnProperty.call(rules, context)) {
        throw new Error(`Rule alread defined: "${ context }"`)
      }

      rules[context] = props
      mixins.forEach(mixin => {
        if (proto.isPrototypeOf(mixin)) {
          mixin._export(context, lists)
        } else {
          lists.push({[context]: mixin})
        }
      })
    } else if (Object.keys(props).length) {
      throw new Error('Decl with props can not be exported without context')
    } else if (mixins.length) {
      throw new Error('Decl with mixins can not be exported without context')
    }

    children.forEach(({selector, decl}) => {
      const nestedContext = Context(selector, context)
      if (proto.isPrototypeOf(decl)) {
        decl._export(nestedContext, lists, rules)
      } else if (!hasOwnProperty.call(rules, nestedContext)) {
        rules[nestedContext] = decl
      } else {
        throw new Error(`Rule alread defined: "${ nestedContext }"`)
      }
    })

    if (appended) {
      lists.push(rules)
    }

    return lists
  },

  export(context) {
    const lists = this._export(context, [])

    const mergedRules = {}
    const selectorLists = lists.map(rules => Object.keys(rules))
    merge(selectorLists).forEach(selector => {
      mergedRules[selector] = {}
    })

    return lists.reduce(_.merge, mergedRules)
  },
})

export default (props = {}) =>
  Object.create(proto, {
    mixins: {
      writable: false,
      configurable: false,
      value: [],
    },

    props: {
      writable: false,
      configurable: false,
      value: props,
    },

    children: {
      writable: false,
      configurable: false,
      value: [],
    },
  })

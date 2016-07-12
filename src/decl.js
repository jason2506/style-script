import _ from 'lodash'

import merge from './merge'
import resolve from './resolve'

const hasOwnProperty = Object.prototype.hasOwnProperty
const proto = Object.freeze({
  mixin(decl) {
    this.mixins.push(decl)
    return this
  },

  nest(selectors, decl) {
    this.children.push({selectors, decl})
    return this
  },

  _export(context, lists, rules) {
    const appended = !rules
    if (appended) {
      rules = {}
    }

    const {mixins, props, children} = this
    if (context) {
      const selector = context.join(',')
      if (props) {
        if (hasOwnProperty.call(rules, selector)) {
          throw new Error(`Rule alread defined: "${ selector }"`)
        }

        rules[selector] = props
      }

      mixins.forEach(mixin => {
        if (proto.isPrototypeOf(mixin)) {
          mixin._export(context, lists)
        } else {
          lists.push({[selector]: mixin})
        }
      })
    } else if (props && Object.keys(props).length) {
      throw new Error('Decl with props can not be exported without context')
    } else if (mixins.length) {
      throw new Error('Decl with mixins can not be exported without context')
    }

    children.forEach(({selectors, decl}) => {
      const nestedContext = resolve(selectors, context)
      if (proto.isPrototypeOf(decl)) {
        decl._export(nestedContext, lists, rules)
      } else {
        const selector = nestedContext.join(',')
        if (hasOwnProperty.call(rules, selector)) {
          throw new Error(`Rule alread defined: "${ selector }"`)
        }

        rules[selector] = decl
      }
    })

    if (appended && Object.keys(rules).length) {
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

export default props =>
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

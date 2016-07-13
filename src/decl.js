import _ from 'lodash'

import merge from './merge'
import resolve from './resolve'

const hasOwnProperty = Object.prototype.hasOwnProperty
const mergeRules = rulesList => {
  const mergedRules = {}
  const selectorLists = rulesList.map(rules => Object.keys(rules))
  merge(selectorLists).forEach(selector => {
    mergedRules[selector] = {}
  })

  return rulesList.reduce(_.merge, mergedRules)
}

const proto = Object.freeze({
  mixin(decl) {
    this.mixins.push(decl)
    return this
  },

  nest(selectors, decl) {
    this.nestedRules.push({ selectors, decl })
    return this
  },

  atMedia(media, decl) {
    this.mediaRules.push({ media, decl })
    return this
  },

  _export(context, mediaMap = { '': [] }, media = '', rules = null) {
    const rulesList = mediaMap[media]
    const appended = !rules
    if (appended) {
      rules = {}
    }

    const { mixins, props, nestedRules, mediaRules } = this
    if (context) {
      const selector = context.join(',')
      if (props) {
        if (hasOwnProperty.call(rules, selector)) {
          throw new Error(`Rule alread defined: "${selector}"`)
        }

        rules[selector] = props
      }

      mixins.forEach(mixin => {
        if (proto.isPrototypeOf(mixin)) {
          mixin._export(context, mediaMap, media)
        } else {
          rulesList.push({ [selector]: mixin })
        }
      })
    } else if (props && Object.keys(props).length) {
      throw new Error('Decl with props can not be exported without context')
    } else if (mixins.length) {
      throw new Error('Decl with mixins can not be exported without context')
    }

    nestedRules.forEach(({ selectors, decl }) => {
      const nestedContext = resolve(selectors, context)
      if (proto.isPrototypeOf(decl)) {
        decl._export(nestedContext, mediaMap, media, rules)
      } else {
        const selector = nestedContext.join(',')
        if (hasOwnProperty.call(rules, selector)) {
          throw new Error(`Rule alread defined: "${selector}"`)
        }

        rules[selector] = decl
      }
    })

    if (mediaRules.length && media !== '') {
      throw new Error('Nested atMedia() inside atMedia() is not supported')
    }

    mediaRules.forEach(({ media: nestedMedia, decl }) => {
      if (!hasOwnProperty.call(mediaMap, nestedMedia)) {
        mediaMap[nestedMedia] = []
      }

      if (proto.isPrototypeOf(decl)) {
        decl._export(context, mediaMap, nestedMedia)
      } else if (context) {
        mediaMap[nestedMedia].push({ [context.join(',')]: decl })
      } else {
        throw new Error('Media rule with props can not be exported without context')
      }
    })

    if (appended && Object.keys(rules).length) {
      rulesList.push(rules)
    }

    return mediaMap
  },

  export(context) {
    const mediaMap = this._export(context)

    const mergedRules = mergeRules(mediaMap[''])
    delete mediaMap['']

    Object.keys(mediaMap)
      .forEach(media => {
        mergedRules[`@media ${media}`] = mergeRules(mediaMap[media])
      })

    return mergedRules
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

    nestedRules: {
      writable: false,
      configurable: false,
      value: [],
    },

    mediaRules: {
      writable: false,
      configurable: false,
      value: [],
    },
  })

import _ from 'lodash'

import merge from './merge'
import resolve from './resolve'

const hasOwnProperty = Object.prototype.hasOwnProperty
const addRule = (rules, selector, props, media) => {
  if (hasOwnProperty.call(rules, selector)) {
    const atMedia = media ? ` [@media ${media}]` : ''
    throw new Error(`Rule alread defined: "${selector}"${atMedia}`)
  }

  rules[selector] = props
}

const mergeRules = (mediaMaps, media) => {
  const mergedRules = {}
  const rulesList = mediaMaps.map(mediaMap => mediaMap[media] || {})
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

  _dumpMediaRules(list = []) {
    const { mediaRules, nestedRules } = this
    list.push(mediaRules.map(({ media }) => media))
    nestedRules.forEach(({ decl }) => {
      if (proto.isPrototypeOf(decl)) {
        decl._dumpMediaRules(list)
      }
    })

    return list
  },

  _export(context, mediaMaps = [], media = '', mediaMap = null) {
    const appended = !mediaMap
    if (appended) {
      mediaMap = { [media]: {} }
    }

    const rules = mediaMap[media]
    const { mixins, props, nestedRules, mediaRules } = this
    if (context) {
      const selector = context.join(',')
      if (props) {
        addRule(rules, selector, props, media)
      }

      mixins.forEach(mixin => {
        if (proto.isPrototypeOf(mixin)) {
          mixin._export(context, mediaMaps, media)
        } else {
          mediaMaps.push({ [media]: { [selector]: mixin } })
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
        decl._export(nestedContext, mediaMaps, media, mediaMap)
      } else {
        addRule(rules, nestedContext.join(','), decl, media)
      }
    })

    if (mediaRules.length && media !== '') {
      throw new Error('Nested atMedia() inside atMedia() is not supported')
    }

    mediaRules.forEach(({ media: nestedMedia, decl }) => {
      if (!hasOwnProperty.call(mediaMap, nestedMedia)) {
        mediaMap[nestedMedia] = {}
      }

      if (proto.isPrototypeOf(decl)) {
        decl._export(context, mediaMaps, nestedMedia, mediaMap)
      } else if (context) {
        addRule(mediaMap[nestedMedia], context.join(','), decl, nestedMedia)
      } else {
        throw new Error('Media rule with props can not be exported without context')
      }
    })

    if (appended) {
      mediaMaps.push(mediaMap)
    }

    return mediaMaps
  },

  export(context) {
    const mediaMaps = this._export(context)
    const mergedRules = mergeRules(mediaMaps, '')
    merge(this._dumpMediaRules())
      .forEach(media => {
        const query = `@media ${media}`
        if (hasOwnProperty.call(mergedRules, query)) {
          throw new Error(`Media rule alread defined: "${query}"`)
        }

        mergedRules[query] = mergeRules(mediaMaps, media)
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

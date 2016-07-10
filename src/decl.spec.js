import {expect} from 'chai'

import Context from './context'
import Decl from './decl'

describe('Decl', () => {
  describe('#_export()', () => {
    it('should throw error when non-empty Decl is exported without context', () => {
      const decl = Decl({
        fontSize: 16,
        lineHeight: 1.5,
      })

      const f = () => decl._export(null, [])
      expect(f).to.throw(Error, /^Decl with props can not be exported without context$/)
    })

    it('should export Decl as list of rules', () => {
      const decl = Decl({
        fontSize: 16,
        lineHeight: 1.5,
      })

      const context = Context('html', null)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        {
          html: {
            fontSize: 16,
            lineHeight: 1.5,
          },
        },
      ])
    })

    it('should handle Decl with nested context', () => {
      const decl = Decl({
        boxSizing: 'border-box',
      })

      const parent = Context('*', null)
      const context = Context(_ => [_, `${ _ }:before`, `${ _ }:after`], parent)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        {
          '*,*:before,*:after': {
            boxSizing: 'border-box',
          },
        },
      ])
    })

    it('should resolve nested rules', () => {
      const decl = Decl({
        color: '#333',
      })
        .nest(_ => [`${ _ }:hover`, `${ _ }:active`], {
          color: '#666',
        })
        .nest(_ => `${ _ }:visited`, {
          color: '#999',
        })

      const context = Context('.foo', null)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        {
          '.foo': {
            color: '#333',
          },

          '.foo:hover,.foo:active': {
            color: '#666',
          },

          '.foo:visited': {
            color: '#999',
          },
        },
      ])
    })

    it('should detect conflicted rule declared with plain-object', () => {
      const decl = Decl().nest(_ => '.foo', {})
      const context = Context('.foo', null)
      const f = () => decl._export(context, [])
      expect(f).to.throw(Error, /^Rule alread defined: ".foo"$/)
    })

    it('should detect conflicted rule declared with Decl()', () => {
      const decl = Decl().nest(_ => '.foo', Decl())
      const context = Context('.foo', null)
      const f = () => decl._export(context, [])
      expect(f).to.throw(Error, /^Rule alread defined: ".foo"$/)
    })

    it('should throw error when Decl with mixin is exported without context', () => {
      const decl = Decl().mixin({})
      const f = () => decl._export(null, [])
      expect(f).to.throw(Error, /^Decl with mixins can not be exported without context$/)
    })

    it('should export mixin defined with plain-object', () => {
      const size = (width, height) => ({width, height})
      const decl = Decl({display: 'block'}).mixin(size(250, 300))

      const context = Context('.box', null)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        { // mixin in decl
          '.box': {
            width: 250,
            height: 300,
          },
        },

        { // decl
          '.box': {
            display: 'block',
          },
        },
      ])
    })

    it('should export mixin created with Decl()', () => {
      const size = (width, height) => Decl({width, height})
      const decl = Decl({display: 'block'}).mixin(size(250, 300))

      const context = Context('.box', null)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        { // mixin in decl
          '.box': {
            width: 250,
            height: 300,
          },
        },

        { // decl
          '.box': {
            display: 'block',
          },
        },
      ])
    })

    it('should export mixins in the same order of application', () => {
      const decl = Decl({fontSize: 16})
        .mixin({lineHeight: 1.5})
        .mixin({color: 'red'})

      const context = Context('.foo', null)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        { // first mixin
          '.foo': {lineHeight: 1.5},
        },

        { // second mixin
          '.foo': {color: 'red'},
        },

        { // decl
          '.foo': {fontSize: 16},
        },
      ])
    })

    it('should export mixin with nested rules', () => {
      const mixin = Decl({position: 'relative'})
        .nest('> .nested', {position: 'absolute'})
      const decl = Decl({background: '#ccc'})
        .mixin(mixin)

      const context = Context('.foo', null)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        { // mixin in decl
          '.foo': {
            position: 'relative',
          },

          '.foo > .nested': {
            position: 'absolute',
          },
        },

        { // decl
          '.foo': {
            background: '#ccc',
          },
        },
      ])
    })

    it('should export mixin applied to nested rule', () => {
      const decl = Decl()
        .nest('.nested',
          Decl({
            fontSize: 16,
          }).mixin({
            lineHeight: 1.5,
          })
        )
        .mixin({color: 'red'})

      const context = Context('.foo', null)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        { // mixin in decl
          '.foo': {
            color: 'red',
          },
        },

        { // mixin in nested decl
          '.foo .nested': {
            lineHeight: 1.5,
          },
        },

        { // decl
          '.foo': {},

          '.foo .nested': {
            fontSize: 16,
          },
        },
      ])
    })

    it('should export mixin applied to another mixin', () => {
      const mixin = Decl({color: 'red'}).mixin({color: 'blue'})
      const decl = Decl({color: 'green'}).mixin(mixin)

      const context = Context('.foo', null)
      const lists = decl._export(context, [])
      expect(lists).to.eql([
        { // mixin in mixin
          '.foo': {color: 'blue'},
        },

        { // mixin in decl
          '.foo': {color: 'red'},
        },

        { // decl
          '.foo': {color: 'green'},
        },
      ])
    })
  })

  describe('#export()', () => {
    it('should export object representation of CSS rules', () => {
      const decl = Decl({color: '#333'})
        .nest(_ => `${ _ }.active`, {color: '#666'})
      const context = Context('.foo', null)
      const result = decl.export(context)
      expect(result).to.eql({
        '.foo': {color: '#333'},
        '.foo.active': {color: '#666'},
      })
    })

    it('should apply mixin to declaration', () => {
      const decl = Decl({
        fontSize: 16,
        lineHeight: 1.2,
      })
        .mixin({
          lineHeight: 1.5,
          color: 'red',
        })

      const context = Context('.foo', null)
      const result = decl.export(context)
      expect(result).to.eql({
        '.foo': {
          fontSize: 16,
          lineHeight: 1.2,
          color: 'red',
        },
      })
    })

    it('should apply mixins in the same order of application', () => {
      const decl = Decl({lineHeight: 1})
        .mixin({
          fontSize: 16,
          lineHeight: 1.5,
          color: 'red',
        })
        .mixin({
          lineHeight: 1.2,
          color: 'blue',
        })

      const context = Context('.foo', null)
      const result = decl.export(context)
      expect(result).to.eql({
        '.foo': {
          fontSize: 16,
          lineHeight: 1,
          color: 'blue',
        },
      })
    })

    it('should export rules with correct order', () => {
      const mixin = Decl({})
        .nest(_ => `${ _ }:hover`, {})
        .nest(_ => `${ _ }:active`, {})
      const decl = Decl({})
        .nest(_ => `${ _ }:focus`, {})
        .nest(_ => `${ _ }:hover`, {})
        .mixin(mixin)

      const context = Context('.foo', null)
      const result = decl.export(context)
      expect(Object.keys(result)).to.eql([
        '.foo',
        '.foo:focus',
        '.foo:hover',
        '.foo:active',
      ])
    })
  })
})

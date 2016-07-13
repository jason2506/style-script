import {expect} from 'chai'

import Decl from './decl'

describe('Decl', () => {
  describe('#_export()', () => {
    it('should not export Decl without props', () => {
      const decl = Decl()
      const result = decl._export()
      expect(result).to.eql({'': []})
    })

    it('should throw error when non-empty Decl is exported without context', () => {
      const decl = Decl({
        fontSize: 16,
        lineHeight: 1.5,
      })

      const f = () => decl._export()
      expect(f).to.throw(Error, /^Decl with props can not be exported without context$/)
    })

    it('should export Decl as list of rules', () => {
      const decl = Decl({
        fontSize: 16,
        lineHeight: 1.5,
      })

      const result = decl._export(['html'])
      expect(result).to.eql({
        '': [
          {
            html: {
              fontSize: 16,
              lineHeight: 1.5,
            },
          },
        ],
      })
    })

    it('should handle Decl with multiple selectors', () => {
      const decl = Decl({
        boxSizing: 'border-box',
      })

      const result = decl._export(['*', '*:before', '*:after'])
      expect(result).to.eql({
        '': [
          {
            '*,*:before,*:after': {
              boxSizing: 'border-box',
            },
          },
        ],
      })
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

      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [
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
        ],
      })
    })

    it('should detect conflicted rule declared with plain-object', () => {
      const decl = Decl({}).nest(_ => '.foo', {})
      const f = () => decl._export(['.foo'])
      expect(f).to.throw(Error, /^Rule alread defined: ".foo"$/)
    })

    it('should detect conflicted rule declared with Decl()', () => {
      const decl = Decl({}).nest(_ => '.foo', Decl({}))
      const f = () => decl._export(['.foo'])
      expect(f).to.throw(Error, /^Rule alread defined: ".foo"$/)
    })

    it('should throw error when Decl with mixin is exported without context', () => {
      const decl = Decl().mixin({})
      const f = () => decl._export()
      expect(f).to.throw(Error, /^Decl with mixins can not be exported without context$/)
    })

    it('should export mixin defined with plain-object', () => {
      const size = (width, height) => ({width, height})
      const decl = Decl({display: 'block'}).mixin(size(250, 300))
      const result = decl._export(['.box'])
      expect(result).to.eql({
        '': [
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
        ],
      })
    })

    it('should export mixin created with Decl()', () => {
      const size = (width, height) => Decl({width, height})
      const decl = Decl({display: 'block'}).mixin(size(250, 300))
      const result = decl._export(['.box'])
      expect(result).to.eql({
        '': [
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
        ],
      })
    })

    it('should export mixins in the same order of application', () => {
      const decl = Decl({fontSize: 16})
        .mixin({lineHeight: 1.5})
        .mixin({color: 'red'})

      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [
          { // first mixin
            '.foo': {lineHeight: 1.5},
          },

          { // second mixin
            '.foo': {color: 'red'},
          },

          { // decl
            '.foo': {fontSize: 16},
          },
        ],
      })
    })

    it('should export mixin with nested rules', () => {
      const mixin = Decl({position: 'relative'})
        .nest('> .nested', {position: 'absolute'})
      const decl = Decl({background: '#ccc'})
        .mixin(mixin)

      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [
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
        ],
      })
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

      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [
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
            '.foo .nested': {
              fontSize: 16,
            },
          },
        ],
      })
    })

    it('should export mixin applied to another mixin', () => {
      const mixin = Decl({color: 'red'}).mixin({color: 'blue'})
      const decl = Decl({color: 'green'}).mixin(mixin)
      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [
          { // mixin in mixin
            '.foo': {color: 'blue'},
          },

          { // mixin in decl
            '.foo': {color: 'red'},
          },

          { // decl
            '.foo': {color: 'green'},
          },
        ],
      })
    })

    it('should resolve media rule declared with plain-object', () => {
      const decl = Decl({fontSize: 16})
        .atMedia('(max-width: 480px)', {fontSize: 12})

      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [
          {
            '.foo': {fontSize: 16},
          },
        ],

        '(max-width: 480px)': [
          {
            '.foo': {fontSize: 12},
          },
        ],
      })
    })

    it('should resolve media rule declared with Decl()', () => {
      const decl = Decl({fontSize: 16})
        .atMedia('(max-width: 480px)', Decl({fontSize: 12}))

      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [
          {
            '.foo': {fontSize: 16},
          },
        ],

        '(max-width: 480px)': [
          {
            '.foo': {fontSize: 12},
          },
        ],
      })
    })

    it('should resolve multiple media rules', () => {
      const decl = Decl()
        .atMedia('(max-width: 480px)', {
          fontSize: 12,
          lineHeight: 1.2,
        })
        .atMedia('(max-width: 360px)', {fontSize: 10})
        .atMedia('(max-width: 360px)', {lineHeight: 1})

      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [],

        '(max-width: 480px)': [
          {
            '.foo': {
              fontSize: 12,
              lineHeight: 1.2,
            },
          },
        ],

        '(max-width: 360px)': [
          {
            '.foo': {fontSize: 10},
          },

          {
            '.foo': {lineHeight: 1},
          },
        ],
      })
    })

    it('should resolve media rule of nested rule', () => {
      const decl = Decl()
        .atMedia('(max-width: 480px)', Decl().nest('.bar', {fontSize: 12}))
        .nest('.bar', Decl().atMedia('(max-width: 480px)', {lineHeight: 1.2}))

      const result = decl._export(['.foo'])
      expect(result).to.eql({
        '': [],

        '(max-width: 480px)': [
          {
            '.foo .bar': {lineHeight: 1.2},
          },

          {
            '.foo .bar': {fontSize: 12},
          },
        ],
      })
    })

    it('should throw error when nesting atMedia() inside atMedia()', () => {
      const decl = Decl()
        .atMedia('(max-width: 480px)', Decl().atMedia('(min-width: 240px)', {}))

      const f = () => decl._export(['.foo'])
      expect(f).to.throw(Error, /^Nested atMedia\(\) inside atMedia\(\) is not supported$/)
    })
  })

  describe('#export()', () => {
    it('should export object representation of CSS rules', () => {
      const decl = Decl({color: '#333'})
        .nest(_ => `${ _ }.active`, {color: '#666'})
      const result = decl.export(['.foo'])
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

      const result = decl.export(['.foo'])
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

      const result = decl.export(['.foo'])
      expect(result).to.eql({
        '.foo': {
          fontSize: 16,
          lineHeight: 1,
          color: 'blue',
        },
      })
    })

    it('should export nested rules with correct order', () => {
      const mixin = Decl({})
        .nest(_ => `${ _ }:hover`, {})
        .nest(_ => `${ _ }:active`, {})
      const decl = Decl({})
        .nest(_ => `${ _ }:focus`, {})
        .nest(_ => `${ _ }:hover`, {})
        .mixin(mixin)

      const result = decl.export(['.foo'])
      expect(Object.keys(result)).to.eql([
        '.foo',
        '.foo:focus',
        '.foo:hover',
        '.foo:active',
      ])
    })

    it('should merge media rules with same query', () => {
      const decl = Decl()
        .nest('.bar', Decl().atMedia('(max-width: 480px)', {lineHeight: 1.2}))
        .atMedia('(max-width: 480px)', Decl().nest('.bar', {fontSize: 12}))

      const result = decl.export(['.foo'])
      expect(result).to.eql({
        '@media (max-width: 480px)': {
          '.foo .bar': {
            fontSize: 12,
            lineHeight: 1.2,
          },
        },
      })
    })
  })
})

import chai, {expect} from 'chai'
import spies from 'chai-spies'

import Context from './context'

chai.use(spies)

describe('Context', () => {
  describe('#resolve()', () => {
    it('should return array with given selector string', () => {
      const context = Context('.foo', null)
      expect(context.resolve()).to.eql(['.foo'])
    })

    it('should return array contains all given selectors', () => {
      const context = Context(['.a', '.b > .c', '.d .e'], null)
      expect(context.resolve()).to.eql(['.a', '.b > .c', '.d .e'])
    })

    it('should concatenate each selector with each selector resolved from parent (1:1)', () => {
      const parent = Context('.a', null)
      const context = Context('.x', parent)
      expect(context.resolve()).to.eql(['.a .x'])
    })

    it('should concatenate each selector with each selector resolved from parent (n:1)', () => {
      const parent = Context('.a', null)
      const context = Context(['.x', '.y'], parent)
      expect(context.resolve()).to.eql(['.a .x', '.a .y'])
    })

    it('should concatenate each selector with each selector resolved from parent (1:m)', () => {
      const parent = Context(['.a', '.b'], null)
      const context = Context('.x', parent)
      expect(context.resolve()).to.eql(['.a .x', '.b .x'])
    })

    it('should concatenate each selector with each selector resolved from parent (n:m)', () => {
      const parent = Context(['.a', '.b'], null)
      const context = Context(['.x', '.y'], parent)
      expect(context.resolve()).to.eql([
        '.a .x',
        '.a .y',
        '.b .x',
        '.b .y',
      ])
    })

    it('should pass resolved selector of parent context to selector function', () => {
      const spy = chai.spy(_ => `${ _ }-bar`)
      const parent = Context('.foo', null)
      Context(spy, parent).resolve()
      expect(spy).to.have.been.called.exactly(1)
      expect(spy).to.have.been.called.with.exactly('.foo')
    })

    it('should call selector function with each resolved selector of parent context', () => {
      const spy = chai.spy(_ => `${ _ }-x`)
      const parent = Context(['.a', '.b > .c', '.d .e'], null)
      Context(spy, parent).resolve()
      expect(spy).to.have.been.called.exactly(3)
      expect(spy).to.have.been.called.with.exactly('.a')
      expect(spy).to.have.been.called.with.exactly('.b > .c')
      expect(spy).to.have.been.called.with.exactly('.d .e')
    })

    it('should resolve selectors with single result of selector function', () => {
      const parent = Context(['.a', '.b > .c', '.d .e'], null)
      const context = Context(_ => `${ _ }-x`, parent)
      expect(context.resolve()).to.eql([
        '.a-x',
        '.b > .c-x',
        '.d .e-x',
      ])
    })

    it('should resolve selectors with each result of selector function', () => {
      const parent = Context(['.a', '.b > .c', '.d .e'], null)
      const context = Context(_ => [`${ _ }-x`, `${ _ }-y`], parent)
      expect(context.resolve()).to.eql([
        '.a-x',
        '.a-y',
        '.b > .c-x',
        '.b > .c-y',
        '.d .e-x',
        '.d .e-y',
      ])
    })

    it('should resolve selectors with higher-level context', () => {
      const grandparent = Context(['.a', '.b', '.c'], null)
      const parent = Context(_ => `${ _ }-d`, grandparent)
      const context = Context(['.e', '.f'], parent)
      expect(context.resolve()).to.eql([
        '.a-d .e',
        '.a-d .f',
        '.b-d .e',
        '.b-d .f',
        '.c-d .e',
        '.c-d .f',
      ])
    })
  })

  describe('#toString()', () => {
    it('should return given selector string', () => {
      const context = Context('.foo', null)
      expect(context.toString()).to.equal('.foo')
    })

    it('should convert selector to string with toString() method', () => {
      const context = Context({
        toString() {
          return '.foo'
        },
      }, null)
      expect(context.toString()).to.equal('.foo')
    })

    it('should concatenate all selectors with comma', () => {
      const context = Context(['.a', '.b > .c', '.d .e'], null)
      expect(context.toString()).to.equal('.a,.b > .c,.d .e')
    })
  })
})

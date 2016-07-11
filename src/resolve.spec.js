import chai, {expect} from 'chai'
import spies from 'chai-spies'

import resolve from './resolve'

chai.use(spies)

describe('resolve()', () => {
  it('should return array with given selector string', () => {
    const selectors = resolve('.foo')
    expect(selectors).to.eql(['.foo'])
  })

  it('should return array contains all given selectors', () => {
    const selectors = resolve(['.a', '.b > .c', '.d .e'])
    expect(selectors).to.eql(['.a', '.b > .c', '.d .e'])
  })

  it('should concatenate selector with its context (1:1)', () => {
    const context = resolve('.a')
    const selectors = resolve('.x', context)
    expect(selectors).to.eql(['.a .x'])
  })

  it('should concatenate selector with its context (n:1)', () => {
    const context = resolve('.a')
    const selectors = resolve(['.x', '.y'], context)
    expect(selectors).to.eql(['.a .x', '.a .y'])
  })

  it('should concatenate selector with its context (1:m)', () => {
    const context = resolve(['.a', '.b'])
    const selectors = resolve('.x', context)
    expect(selectors).to.eql(['.a .x', '.b .x'])
  })

  it('should concatenate selector with its context (n:m)', () => {
    const context = resolve(['.a', '.b'])
    const selectors = resolve(['.x', '.y'], context)
    expect(selectors).to.eql([
      '.a .x',
      '.a .y',
      '.b .x',
      '.b .y',
    ])
  })

  it('should pass resolved selector of context to selector function', () => {
    const spy = chai.spy(_ => `${ _ }-bar`)
    const context = resolve('.foo')
    resolve(spy, context)
    expect(spy).to.have.been.called.exactly(1)
    expect(spy).to.have.been.called.with.exactly('.foo')
  })

  it('should call selector function with each resolved selector of context', () => {
    const spy = chai.spy(_ => `${ _ }-x`)
    const context = resolve(['.a', '.b > .c', '.d .e'])
    resolve(spy, context)
    expect(spy).to.have.been.called.exactly(3)
    expect(spy).to.have.been.called.with.exactly('.a')
    expect(spy).to.have.been.called.with.exactly('.b > .c')
    expect(spy).to.have.been.called.with.exactly('.d .e')
  })

  it('should resolve selectors with single result of selector function', () => {
    const context = resolve(['.a', '.b > .c', '.d .e'])
    const selectors = resolve(_ => `${ _ }-x`, context)
    expect(selectors).to.eql([
      '.a-x',
      '.b > .c-x',
      '.d .e-x',
    ])
  })

  it('should resolve selectors with each result of selector function', () => {
    const context = resolve(['.a', '.b > .c', '.d .e'])
    const selectors = resolve(_ => [`${ _ }-x`, `${ _ }-y`], context)
    expect(selectors).to.eql([
      '.a-x',
      '.a-y',
      '.b > .c-x',
      '.b > .c-y',
      '.d .e-x',
      '.d .e-y',
    ])
  })

  it('should resolve selectors with higher-level context', () => {
    const parentContext = resolve(['.a', '.b', '.c'])
    const context = resolve(_ => `${ _ }-d`, parentContext)
    const selectors = resolve(['.e', '.f'], context)
    expect(selectors).to.eql([
      '.a-d .e',
      '.a-d .f',
      '.b-d .e',
      '.b-d .f',
      '.c-d .e',
      '.c-d .f',
    ])
  })
})

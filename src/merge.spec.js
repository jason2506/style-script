import chai, {expect} from 'chai'
import spies from 'chai-spies'

import merge, {updateWithDefault, getCounts} from './merge'

chai.use(spies)

describe('updateWithDefault()', () => {
  context('if key is not in the map', () => {
    it('should involve update function with default value', () => {
      const map = {}
      const spy = chai.spy(val => val)
      updateWithDefault(map, 'key', 'default', spy)
      expect(spy).to.have.been.called.exactly(1)
      expect(spy).to.have.been.called.with.exactly('default')
    })

    it('should insert key with result of update function', () => {
      const map = {}
      updateWithDefault(map, 'key', 'default', val => `${ val } value`)
      expect(map.key).to.equal('default value')
    })
  })

  context('if key is in the map', () => {
    it('should invlove update function with existing value', () => {
      const map = {key: 'existing'}
      const spy = chai.spy(val => val)
      updateWithDefault(map, 'key', 'default', spy)
      expect(spy).to.have.been.called.exactly(1)
      expect(spy).to.have.been.called.with.exactly('existing')
    })

    it('should update map with result of update function', () => {
      const map = {key: 'existing'}
      updateWithDefault(map, 'key', 'default', val => `${ val } value`)
      expect(map.key).to.equal('existing value')
    })
  })
})

describe('getCounts()', () => {
  it('should get parent/child counts for each element', () => {
    const lists = [
      ['a', 'b', 'c', 'e'],
      ['b', 'c', 'f'],
      ['c', 'd', 'e', 'f'],
    ]

    const parentCounts = {}
    const childCounts = {}
    getCounts(lists, parentCounts, childCounts)

    expect(parentCounts).to.eql({
      a: 0,
      b: 1,
      c: 2,
      d: 1,
      e: 2,
      f: 2,
    })

    expect(childCounts).to.eql({
      a: {b: 1},
      b: {c: 2},
      c: {d: 1, e: 1, f: 1},
      d: {e: 1},
      e: {f: 1},
      // f: {},
    })
  })
})

describe('merge()', () => {
  it('should handle single list', () => {
    const lists = [['a', 'b', 'c', 'd']]
    const result = merge(lists)
    expect(result).to.eql(['a', 'b', 'c', 'd'])
  })

  it('should merge multiple ordered lists into one', () => {
    const lists = [
      ['a', 'b', 'c', 'e'],
      ['b', 'c', 'f'],
      ['c', 'd', 'e', 'f'],
    ]

    const result = merge(lists)
    expect(result).to.eql(['a', 'b', 'c', 'd', 'e', 'f'])
  })

  it('should throw error if there is no solution for the merge operation', () => {
    const lists = [
      ['a', 'b'],
      ['b', 'a'],
    ]

    const f = () => merge(lists)
    expect(f).to.throw(Error)
  })
})

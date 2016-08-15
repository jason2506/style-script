import { expect } from 'chai'

import { toArray as _toArray, normalize } from './directions'

const toArray = _toArray(
  'directions',
  'firstAndThird', 'secondAndFourth',
  'first', 'second', 'third', 'fourth'
)

describe('directions module', () => {
  describe('toArray()', () => {
    it('should handle object with key "all"', () => {
      expect(toArray({
        all: 'all',
      })).to.eql(['all', 'all', 'all', 'all'])
    })

    it('should handle object with "firstAndThird"', () => {
      expect(toArray({
        all: 'all',
        firstAndThird: 'firstAndThird',
      })).to.eql(['firstAndThird', 'all', 'firstAndThird', 'all'])
    })

    it('should handle object with "secondAndFourth"', () => {
      expect(toArray({
        all: 'all',
        secondAndFourth: 'secondAndFourth',
      })).to.eql(['all', 'secondAndFourth', 'all', 'secondAndFourth'])
    })

    it('should handle object with "first"', () => {
      expect(toArray({
        all: 'all',
        firstAndThird: 'firstAndThird',
        secondAndFourth: 'secondAndFourth',
        first: 'first',
      })).to.eql(['first', 'secondAndFourth', 'firstAndThird', 'secondAndFourth'])
    })

    it('should handle object with "second"', () => {
      expect(toArray({
        all: 'all',
        firstAndThird: 'firstAndThird',
        secondAndFourth: 'secondAndFourth',
        second: 'second',
      })).to.eql(['firstAndThird', 'second', 'firstAndThird', 'secondAndFourth'])
    })

    it('should handle object with "third"', () => {
      expect(toArray({
        all: 'all',
        firstAndThird: 'firstAndThird',
        secondAndFourth: 'secondAndFourth',
        third: 'third',
      })).to.eql(['firstAndThird', 'secondAndFourth', 'third', 'secondAndFourth'])
    })

    it('should handle object with "fourth"', () => {
      expect(toArray({
        all: 'all',
        firstAndThird: 'firstAndThird',
        secondAndFourth: 'secondAndFourth',
        fourth: 'fourth',
      })).to.eql(['firstAndThird', 'secondAndFourth', 'firstAndThird', 'fourth'])
    })

    it('should reject parameter other than array and object', () => {
      const f = () => toArray(123)
      expect(f).to.throw(Error, /^123 is not a valid value for directions/)
    })
  })

  describe('normalize', () => {
    it('should handle array with single value', () => {
      expect(normalize([0])).to.eql([0])
    })

    it('should handle array with two values', () => {
      expect(normalize([0, 1])).to.eql([0, 1])
    })

    it('should handle array with three values', () => {
      expect(normalize([0, 1, 2])).to.eql([0, 1, 2])
    })

    it('should handle array with four values', () => {
      expect(normalize([0, 1, 2, 3])).to.eql([0, 1, 2, 3])
    })

    it('should handle array with more than four values', () => {
      expect(normalize([0, 1, 2, 3, 4])).to.eql([0, 1, 2, 3])
    })

    it('should merge first and third directions', () => {
      expect(normalize([0, 1, 2, 1])).to.eql([0, 1, 2])
    })

    it('should merge second and fourth directions', () => {
      expect(normalize([0, 1, 0])).to.eql([0, 1])
    })

    it('should merge first/third and second/fourth directions respectively', () => {
      expect(normalize([0, 1, 0, 1])).to.eql([0, 1])
    })

    it('should merge four directions', () => {
      expect(normalize([0, 0, 0, 0])).to.eql([0])
    })
  })
})

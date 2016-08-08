import { expect } from 'chai'

import { toArray, normalize } from './sides'

describe('sides module', () => {
  describe('toArray()', () => {
    it('should handle object with key "all"', () => {
      expect(toArray({
        all: 'all',
      })).to.eql(['all', 'all', 'all', 'all'])
    })

    it('should handle object with "vertical"', () => {
      expect(toArray({
        all: 'all',
        vertical: 'vertical',
      })).to.eql(['vertical', 'all', 'vertical', 'all'])
    })

    it('should handle object with "horizontal"', () => {
      expect(toArray({
        all: 'all',
        horizontal: 'horizontal',
      })).to.eql(['all', 'horizontal', 'all', 'horizontal'])
    })

    it('should handle object with "top"', () => {
      expect(toArray({
        all: 'all',
        vertical: 'vertical',
        horizontal: 'horizontal',
        top: 'top',
      })).to.eql(['top', 'horizontal', 'vertical', 'horizontal'])
    })

    it('should handle object with "right"', () => {
      expect(toArray({
        all: 'all',
        vertical: 'vertical',
        horizontal: 'horizontal',
        right: 'right',
      })).to.eql(['vertical', 'right', 'vertical', 'horizontal'])
    })

    it('should handle object with "bottom"', () => {
      expect(toArray({
        all: 'all',
        vertical: 'vertical',
        horizontal: 'horizontal',
        bottom: 'bottom',
      })).to.eql(['vertical', 'horizontal', 'bottom', 'horizontal'])
    })

    it('should handle object with "left"', () => {
      expect(toArray({
        all: 'all',
        vertical: 'vertical',
        horizontal: 'horizontal',
        left: 'left',
      })).to.eql(['vertical', 'horizontal', 'vertical', 'left'])
    })

    it('should reject parameter other than array and object', () => {
      const f = () => toArray(123)
      expect(f).to.throw(Error, /^123 is not a valid value for sides$/)
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

    it('should merge vertical sides with same values', () => {
      expect(normalize([0, 1, 2, 1])).to.eql([0, 1, 2])
    })

    it('should merge horizontal sides with same values', () => {
      expect(normalize([0, 1, 0])).to.eql([0, 1])
    })

    it('should merge vertical and horizontal sides with values', () => {
      expect(normalize([0, 1, 0, 1])).to.eql([0, 1])
    })

    it('should merge four sides with same values', () => {
      expect(normalize([0, 0, 0, 0])).to.eql([0])
    })
  })
})

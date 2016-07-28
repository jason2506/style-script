import { expect } from 'chai'

import Media from './media'

describe('Media', () => {
  describe('#toString()', () => {
    it('should convert empty media to empty string', () => {
      const media = Media()
      expect(media.toString()).to.equal('')
    })

    it('should export media type', () => {
      const media = Media({ type: 'screen' })
      expect(media.toString()).to.equal('screen')
    })

    it('should not export media type "all"', () => {
      const media = Media({ type: 'all' })
      expect(media.toString()).to.equal('')
    })

    it('should export media features', () => {
      const media = Media({
        features: { orientation: 'landscape' },
      })
      expect(media.toString()).to.equal('(orientation: landscape)')
    })

    it('should export camelCase-named media features', () => {
      const media = Media({
        features: { minWidth: '800px' },
      })
      expect(media.toString()).to.equal('(min-width: 800px)')
    })

    it('should automatically add unit to value of media features', () => {
      const media = Media({
        features: { height: 600 },
      })
      expect(media.toString()).to.equal('(height: 600px)')
    })

    it('should not add unit to media features with value 0', () => {
      const media = Media({
        features: { height: 0 },
      })
      expect(media.toString()).to.equal('(height: 0)')
    })

    it('should export media features with boolean value', () => {
      const media = Media({
        features: {
          color: true,
          grid: false,
        },
      })
      expect(media.toString()).to.equal('(color)')
    })

    it('should export media query with modifier', () => {
      const media = Media({
        modifier: 'not',
        type: 'screen',
      })
      expect(media.toString()).to.equal('not screen')
    })

    it('should export modifier-prefixed media query without specifying media type', () => {
      const media = Media({ modifier: 'only' })
      expect(media.toString()).to.equal('only all')
    })
  })
})

import { expect } from 'chai'

import $ from './selector'

describe('$', () => {
  describe('#attrOp()', () => {
    it('should generate attribute selector with given operator and value', () => {
      const selector = $.attrOp('lang', '|=', 'zh')
      expect(selector).to.equal('[lang|="zh"]')
    })

    it('should append "i" before the closing bracket (])', () => {
      const selector = $.attrOp('lang', '|=', 'zh', { ignoreCase: true })
      expect(selector).to.equal('[lang|="zh" i]')
    })
  })

  describe('#_', () => {
    it('should be an identity function', () => {
      expect($._('.foo')).to.equal('.foo')
    })

    it('should contain selectors (string) defined in $', () => {
      const result = $._.before('.foo')
      expect(result).to.equal(`.foo${$.before}`)
    })

    it('should contain selectors (function) defined in $', () => {
      const result = $._.not('.disabled')('.foo')
      expect(result).to.equal(`.foo${$.not('.disabled')}`)
    })

    it('should contain its additional selector functions', () => {
      const result = $._.prepend('.foo ')('.bar')
      expect(result).to.equal('.foo .bar')
    })
  })
})

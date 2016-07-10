import {expect} from 'chai'

import Decl from './decl'
import StyleSheet from './stylesheet'

describe('StyleSheet', () => {
  describe('#export()', () => {
    it('should export empty object when no rule is added', () => {
      const styles = StyleSheet()
      const result = styles.export()
      expect(result).to.eql({})
    })

    it('should export rules appended with #addRule()', () => {
      const styles = StyleSheet()
        .addRule('html', {
          fontSize: 16,
          lineHeight: 1.5,
          boxSizing: 'border-box',
        })
        .addRule('*',
          Decl()
            .nest(_ => [_, `${ _ }:before`, `${ _ }:after`], {
              boxSizing: 'inherit',
            })
        )

      const result = styles.export()
      expect(result).to.eql({
        html: {
          fontSize: 16,
          lineHeight: 1.5,
          boxSizing: 'border-box',
        },

        '*,*:before,*:after': {
          boxSizing: 'inherit',
        },
      })

      expect(Object.keys(result)).to.eql([
        'html',
        '*,*:before,*:after',
      ])
    })
  })
})

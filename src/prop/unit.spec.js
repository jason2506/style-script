import chai, { expect } from 'chai'
import spies from 'chai-spies'

import { parse, additiveOp, multiplicativeOp } from './unit'

chai.use(spies)

describe('unit', () => {
  describe('parse()', () => {
    it('should parse value with unit', () => {
      const result = parse('25.5em')
      expect(result).to.eql({ unit: 'em', value: 25.5 })
    })

    it('should parse percentage value', () => {
      const result = parse('75%')
      expect(result).to.eql({ unit: '%', value: 75 })
    })

    it('should handle numerical value', () => {
      const result = parse(3.14)
      expect(result).to.eql({ unit: null, value: 3.14 })
    })

    it('should detect invalid value', () => {
      const f = () => parse(NaN)
      expect(f).to.throw(Error, /^NaN is not a valid value$/)
    })
  })

  describe('additiveOp()', () => {
    it('should check whether the unit of values is matched', () => {
      const f = () => additiveOp(() => { /* empty */ })('1em', '2px')
      expect(f).to.throw(Error, /^Incompatible units: "em" and "px"$/)
    })

    it('should invoke op function with unitless value', () => {
      const op = chai.spy()
      additiveOp(op)('5em', '8em')
      expect(op).to.have.been.called.exactly(1)
      expect(op).to.have.been.called.with.exactly(5, 8)
    })

    it('should return operation result with unit', () => {
      const add = additiveOp((a, b) => a + b)
      expect(add('5em', '8em')).to.equal('13em')
    })
  })

  describe('multiplicativeOp()', () => {
    it('should invoke op function with unitless value', () => {
      const op = chai.spy()
      multiplicativeOp(op)('10px', -1.5)
      expect(op).to.have.been.called.exactly(1)
      expect(op).to.have.been.called.with.exactly(10, -1.5)
    })

    it('should return operation result with unit', () => {
      const mul = multiplicativeOp((a, b) => a * b)
      expect(mul('10px', -1.5)).to.equal('-15px')
    })
  })
})

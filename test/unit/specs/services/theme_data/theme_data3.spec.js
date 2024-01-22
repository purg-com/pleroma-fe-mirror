// import { topoSort } from 'src/services/theme_data/theme_data.service.js'
import {
  getAllPossibleCombinations,
  init,
  ruleToSelector
} from 'src/services/theme_data/theme_data_3.service.js'
import {
  sampleRules
} from 'src/services/theme_data/pleromafe.t3.js'

describe.only('Theme Data 3', () => {
  describe('getAllPossibleCombinations', () => {
    it('test simple case', () => {
      const out = getAllPossibleCombinations([1, 2, 3]).map(x => x.sort((a, b) => a - b))
      expect(out).to.eql([[1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]])
    })
  })

  describe('init', () => {
    it('test simple case', () => {
      const out = init(sampleRules)
      console.log(JSON.stringify(out, null, 2))
      out.forEach(r => console.log(ruleToSelector(r)))
    })
  })
})

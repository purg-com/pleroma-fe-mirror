// import { topoSort } from 'src/services/theme_data/theme_data.service.js'
import {
  getAllPossibleCombinations
} from 'src/services/theme_data/iss_utils.js'
import {
  init
} from 'src/services/theme_data/theme_data_3.service.js'
import {
  basePaletteKeys
} from 'src/services/theme_data/theme2_to_theme3.js'

describe.only('Theme Data 3', () => {
  describe('getAllPossibleCombinations', () => {
    it('test simple case', () => {
      const out = getAllPossibleCombinations([1, 2, 3]).map(x => x.sort((a, b) => a - b))
      expect(out).to.eql([[1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]])
    })
  })

  describe('init', () => {
    it('Test initialization without anything', () => {
      const out = init([], '#DEADAF')

      expect(out).to.have.property('eager')
      expect(out).to.have.property('lazy')
      expect(out).to.have.property('staticVars')

      expect(out.lazy).to.be.an('array')
      expect(out.lazy).to.have.lengthOf.above(1)
      expect(out.eager).to.be.an('array')
      expect(out.eager).to.have.lengthOf.above(1)
      expect(out.staticVars).to.be.an('object')

      // check backwards compat/generic stuff
      basePaletteKeys.forEach(key => {
        expect(out.staticVars).to.have.property(key)
      })
    })
  })
})

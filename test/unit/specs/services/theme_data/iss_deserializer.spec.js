import { deserialize } from 'src/services/theme_data/iss_deserializer.js'
import { serialize } from 'src/services/theme_data/iss_serializer.js'
import Button from 'src/components/button.style.js'

describe('ISS (de)serialization', () => {
  describe('ISS deserialization', () => {
    it('Output should equal input', () => {
      const normalized = Button.defaultRules.map(x => ({ component: 'Button', ...x }))
      const serialized = serialize(normalized)
      const deserialized = deserialize(serialized)

      // for some reason comparing objects directly fails the assert
      expect(JSON.stringify(deserialized)).to.equal(JSON.stringify(normalized))
    })
  })
})

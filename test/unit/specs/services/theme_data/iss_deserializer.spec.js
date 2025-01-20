import { deserialize } from 'src/services/theme_data/iss_deserializer.js'
import { serialize } from 'src/services/theme_data/iss_serializer.js'
const componentsContext = require.context('src', true, /\.style.js(on)?$/)

describe('ISS (de)serialization', () => {
  componentsContext.keys().forEach(key => {
    const component = componentsContext(key).default

    it(`(De)serialization of component ${component.name} works`, () => {
      const normalized = component.defaultRules.map(x => ({ component: component.name, ...x }))
      const serialized = serialize(normalized)
      const deserialized = deserialize(serialized)

      // for some reason comparing objects directly fails the assert
      expect(JSON.stringify(deserialized, null, 2)).to.equal(JSON.stringify(normalized, null, 2))
    })
  })

  /*
  // Debug snippet
  const onlyComponent = componentsContext('./components/panel_header.style.js').default
  it.only(`(De)serialization of component ${onlyComponent.name} works`, () => {
    const normalized = onlyComponent.defaultRules.map(x => ({ component: onlyComponent.name, ...x }))
    console.log('BEGIN INPUT ================')
    console.log(normalized)
    console.log('END INPUT ==================')
    const serialized = serialize(normalized)
    console.log('BEGIN SERIAL ===============')
    console.log(serialized)
    console.log('END SERIAL =================')
    const deserialized = deserialize(serialized)
    console.log('BEGIN DESERIALIZED =========')
    console.log(serialized)
    console.log('END DESERIALIZED ===========')

    // for some reason comparing objects directly fails the assert
    expect(JSON.stringify(deserialized, null, 2)).to.equal(JSON.stringify(normalized, null, 2))
  })
  /* */
})

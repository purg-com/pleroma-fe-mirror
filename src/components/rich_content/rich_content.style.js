export default {
  name: 'RichContent',
  selector: '.RichContent',
  validInnerComponents: [
    'Text',
    'FunText',
    'Link'
  ],
  defaultRules: [
    {
      directives: {
        '--font': 'generic | inherit',
        '--monoFont': 'generic | monospace',
        textNoCssColor: 'yes'
      }
    }
  ]
}

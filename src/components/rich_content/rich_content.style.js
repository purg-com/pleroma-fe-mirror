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
        textNoCssColor: 'yes'
      }
    }
  ]
}

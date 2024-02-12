export default {
  name: 'TopBar',
  selector: 'nav',
  validInnerComponents: [
    'Link',
    'Text',
    'Icon',
    'Button',
    'ButtonUnstyled',
    'Input'
  ],
  defaultRules: [
    {
      directives: {
        background: '--fg'
      }
    }
  ]
}

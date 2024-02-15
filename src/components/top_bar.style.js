export default {
  name: 'TopBar',
  selector: 'nav',
  validInnerComponents: [
    'Link',
    'Text',
    'Icon',
    'Button',
    'ButtonUnstyled',
    'Input',
    'Badge'
  ],
  defaultRules: [
    {
      directives: {
        background: '--fg'
      }
    }
  ]
}

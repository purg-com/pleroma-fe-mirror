export default {
  name: 'TopBar',
  selector: 'nav',
  validInnerComponents: [
    'Link',
    'Text',
    'Icon',
    'Button',
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

export default {
  name: 'Panel',
  selector: '.panel',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button',
    'Input',
    'PanelHeader'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg'
      }
    }
  ]
}

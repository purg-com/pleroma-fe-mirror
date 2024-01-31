export default {
  name: 'Panel',
  selector: '.panel',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button',
    'PanelHeader'
  ],
  defaultRules: [
    {
      component: 'Panel',
      directives: {
        background: '--fg'
      }
    }
  ]
}

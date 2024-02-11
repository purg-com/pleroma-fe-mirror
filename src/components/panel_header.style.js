export default {
  name: 'PanelHeader',
  selector: '.panel-heading',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button'
  ],
  defaultRules: [
    {
      component: 'PanelHeader',
      directives: {
        background: '--fg',
        shadow: []
      }
    }
  ]
}

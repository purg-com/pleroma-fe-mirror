export default {
  name: 'PanelHeader',
  selector: '.panel-heading',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button',
    'ButtonUnstyled',
    'Badge',
    'Alert'
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

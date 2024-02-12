export default {
  name: 'PanelHeader',
  selector: '.panel-heading',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button',
    'ButtonUnstyled'
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

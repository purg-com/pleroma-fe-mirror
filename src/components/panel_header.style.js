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
    'Alert',
    'Avatar'
  ],
  defaultRules: [
    {
      component: 'PanelHeader',
      directives: {
        backgroundNoCssColor: 'yes',
        background: '--fg',
      }
    }
  ]
}

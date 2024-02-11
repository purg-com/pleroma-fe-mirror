export default {
  name: 'Panel',
  selector: '.panel',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button',
    'Input',
    'PanelHeader',
    'MenuItem'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg',
        shadow: [{
          x: 1,
          y: 1,
          blur: 4,
          spread: 0,
          color: '#000000',
          alpha: 0.6
        }]
      }
    }
  ]
}

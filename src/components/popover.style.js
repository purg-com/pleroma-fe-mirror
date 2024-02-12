export default {
  name: 'Popover',
  selector: '.popover',
  variants: {
    tooltip: '.tooltip',
    modal: '.modal'
  },
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button',
    'ButtonUnstyled',
    'Input',
    'PanelHeader',
    'MenuItem',
    'Post'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg',
        shadow: [{
          x: 2,
          y: 2,
          blur: 3,
          spread: 0,
          color: '#000000',
          alpha: 0.5
        }]
      }
    }
  ]
}

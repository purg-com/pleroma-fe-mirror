export default {
  name: 'Popover',
  selector: '.popover',
  lazy: true,
  variants: {
    modal: '.modal'
  },
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Border',
    'Button',
    'ButtonUnstyled',
    'Input',
    'MenuItem',
    'Post',
    'UserCard'
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

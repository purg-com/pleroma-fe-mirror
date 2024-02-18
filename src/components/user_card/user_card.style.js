export default {
  name: 'UserCard',
  selector: '.user-card',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button',
    'ButtonUnstyled',
    'Input',
    'RichContent',
    'Alert'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg',
        roundness: 3,
        shadow: [{
          x: 1,
          y: 1,
          blur: 4,
          spread: 0,
          color: '#000000',
          alpha: 0.6
        }],
        '--profileTint': 'color | $alpha(--background, 0.5)'
      }
    },
    {
      parent: {
        component: 'UserCard'
      },
      component: 'RichContent',
      directives: {
        opacity: 0
      }
    }
  ]
}

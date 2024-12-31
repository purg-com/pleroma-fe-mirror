export default {
  name: 'TopBar',
  selector: 'nav',
  validInnerComponents: [
    'Link',
    'Text',
    'Icon',
    'Button',
    'ButtonUnstyled',
    'Input',
    'Badge'
  ],
  defaultRules: [
    {
      directives: {
        background: '--fg',
        shadow: [{
          x: 0,
          y: 0,
          blur: 4,
          spread: 0,
          color: '#000000',
          alpha: 0.6
        }]
      }
    },
    {
      component: 'Link',
      parent: {
        component: 'TopBar'
      },
      directives: {
        textColor: '--text'
      }
    },
    {
      component: 'Icon',
      parent: {
        component: 'ButtonUnstyled',
        parent: {
          component: 'TopBar'
        }
      },
      directives: {
        textColor: '--parent--text'
      }
    }
  ]
}

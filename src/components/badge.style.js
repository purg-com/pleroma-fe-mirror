export default {
  name: 'Badge',
  selector: '.badge',
  validInnerComponents: [
    'Text',
    'Icon'
  ],
  variants: {
    normal: '.neutral',
    notification: '.notification'
  },
  defaultRules: [
    {
      directives: {
        background: '--cGreen'
      }
    },
    {
      variant: 'notification',
      directives: {
        background: '--cRed'
      }
    }
  ]
}

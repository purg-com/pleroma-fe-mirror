export default {
  name: 'Badge',
  selector: '.badge',
  validInnerComponents: [
    'Text',
    'Icon'
  ],
  variants: {
    notification: '.-notification'
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

export default {
  name: 'Text',
  selector: '/*text*/',
  virtual: true,
  variants: {
    greentext: '.greentext'
  },
  states: {
    faint: '.faint'
  },
  defaultRules: [
    {
      component: 'Text',
      directives: {
        textColor: '--text',
        textAuto: 'no-preserve'
      }
    },
    {
      component: 'Text',
      state: ['faint'],
      directives: {
        textOpacity: 0.5
      }
    },
    {
      component: 'Text',
      variant: 'greentext',
      directives: {
        textColor: '--cGreen',
        textAuto: 'preserve'
      }
    }
  ]
}

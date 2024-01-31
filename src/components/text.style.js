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
        textColor: '--text'
      }
    },
    {
      component: 'Text',
      state: ['faint'],
      directives: {
        textColor: '--text',
        textOpacity: 0.5
      }
    },
    {
      component: 'Text',
      variant: 'greentext',
      directives: {
        textColor: '--cGreen'
      }
    },
    {
      component: 'Text',
      variant: 'greentext',
      state: ['faint'],
      directives: {
        textColor: '--cGreen',
        textOpacity: 0.5
      }
    }
  ]
}

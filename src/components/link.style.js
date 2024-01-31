export default {
  name: 'Link',
  selector: 'a',
  virtual: true,
  states: {
    faint: '.faint'
  },
  defaultRules: [
    {
      component: 'Link',
      directives: {
        textColor: '--link'
      }
    },
    {
      component: 'Link',
      state: ['faint'],
      directives: {
        textColor: '--link',
        textOpacity: 0.5,
        textOpacityMode: 'fake'
      }
    }
  ]
}

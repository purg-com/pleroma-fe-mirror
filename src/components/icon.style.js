export default {
  name: 'Icon',
  virtual: true,
  selector: '.svg-inline--fa',
  defaultRules: [
    {
      component: 'Icon',
      directives: {
        textColor: '--text',
        textOpacity: 0.5,
        textOpacityMode: 'mixrgb',
        textAuto: 'no-auto'
      }
    }
  ]
}

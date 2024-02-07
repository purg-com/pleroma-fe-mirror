export default {
  name: 'Icon',
  virtual: true,
  selector: '.svg-inline--fa',
  defaultRules: [
    {
      component: 'Icon',
      directives: {
        textColor: '--text',
        // textAuto: 'no-auto', // doesn't work well with mixrgb?
        textOpacity: 0.5,
        textOpacityMode: 'mixrgb'
      }
    }
  ]
}

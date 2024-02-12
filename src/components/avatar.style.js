export default {
  name: 'Avatar',
  selector: '.Avatar',
  defaultRules: [
    {
      directives: {
        background: '--bg',
        opacity: 0,
        shadow: [{
          x: 0,
          y: 1,
          blur: 8,
          spread: 0,
          color: '#000000',
          alpha: 0.7
        }]
      }
    }
  ]
}

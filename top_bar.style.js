export default {
  name: 'TopBar',
  selector: 'nav',
  validInnerComponents: [
    'Link',
    'Text',
    'Icon'
  ],
  defaultRules: [
    {
      directives: {
        shadow: [{
          x: 0,
          y: 0,
          blur: 4,
          spread: 0,
          color: '#000000',
          alpha: 0.6
        }]
      }
    }
  ]
}

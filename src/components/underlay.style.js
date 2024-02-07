export default {
  name: 'Underlay',
  selector: 'body', // Should be '#content' but for now this is better for testing until I have proper popovers and such...
  outOfTreeSelector: '.underlay',
  validInnerComponents: [
    'Panel'
  ],
  defaultRules: [
    {
      component: 'Underlay',
      // variant: 'normal',
      // state: 'normal'
      directives: {
        background: '#000000',
        opacity: 0.2
      }
    }
  ]
}

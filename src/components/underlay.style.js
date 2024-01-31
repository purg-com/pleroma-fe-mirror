export default {
  name: 'Underlay',
  selector: '#content',
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

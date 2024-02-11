export default {
  name: 'Root',
  selector: ':root',
  validInnerComponents: [
    'Underlay',
    'Modals',
    'TopBar'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg',
        opacity: 0
      }
    }
  ]
}

export default {
  name: 'Root',
  selector: ':root',
  validInnerComponents: [
    'Underlay',
    'TopBar',
    'Popover'
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

export default {
  name: 'Root',
  selector: ':root',
  validInnerComponents: [
    'Underlay',
    'Modals',
    'Popover',
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

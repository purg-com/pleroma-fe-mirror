export default {
  name: 'Root',
  selector: ':root',
  validInnerComponents: [
    'Underlay',
    'Modals',
    'Popover',
    'TopBar',
    'Scrollbar',
    'ScrollbarElement',
    'MobileDrawer'
  ],
  defaultRules: [
    {
      directives: {
        '--font': 'generic | sans-serif'
      }
    }
  ]
}

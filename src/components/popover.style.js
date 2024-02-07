export default {
  name: 'Popover',
  selector: '.popover',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Button',
    'Input',
    'PanelHeader',
    'DropdownMenu'
  ],
  defaultRules: [
    {
      directives: {
        background: '--fg'
      }
    }
  ]
}

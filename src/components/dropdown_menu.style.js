export default {
  name: 'DropdownMenu',
  selector: '.dropdown',
  validInnerComponents: [
    'Text',
    'Icon',
    'Input'
  ],
  states: {
    hover: ':hover'
  },
  defaultRules: [
    {
      directives: {
        background: '--fg'
      }
    }
  ]
}

export default {
  name: 'MenuItem',
  selector: '.menu-item',
  validInnerComponents: [
    'Text',
    'Icon',
    'Input',
    'Border'
  ],
  states: {
    hover: ':hover',
    active: 'active'
  },
  defaultRules: [
    {
      directives: {
        background: '--fg'
      }
    },
    {
      component: 'Text',
      variant: 'normal',
      parent: {
        component: 'MenuItem',
        state: ['normal', 'hover'],
        variant: 'normal'
      },
      directives: {
        textColor: '--link',
        textAuto: 'no-preserve'
      }
    },
    {
      component: 'Icon',
      parent: {
        component: 'MenuItem',
        state: ['hover']
      },
      directives: {
        textColor: '--link',
        textAuto: 'no-preserve'
      }
    }
  ]
}

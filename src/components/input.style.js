export default {
  name: 'Input',
  selector: '.input',
  states: {
    hover: ':hover:not(.disabled)',
    focused: ':focus-within',
    disabled: '.disabled'
  },
  variants: {
    checkbox: '.-checkbox',
    radio: '.-radio'
  },
  validInnerComponents: [
    'Text',
    'Icon'
  ],
  defaultRules: [
    {
      component: 'Root',
      directives: {
        '--inputDefaultBevel': 'shadow | $borderSide(#FFFFFF bottom 0.2), $borderSide(#000000 top 0.2)',
        '--inputDefaultHoverGlow': 'shadow | 0 0 4 --text / 0.5',
        '--inputDefaultFocusGlow': 'shadow | 0 0 4 4 --link / 0.5'
      }
    },
    {
      variant: 'checkbox',
      directives: {
        roundness: 1
      }
    },
    {
      directives: {
        '--font': 'generic | inherit',
        background: '--fg, -5',
        roundness: 3,
        shadow: [{
          x: 0,
          y: 0,
          blur: 2,
          spread: 0,
          color: '#000000',
          alpha: 1
        }, '--inputDefaultBevel']
      }
    },
    {
      state: ['hover'],
      directives: {
        shadow: ['--inputDefaultHoverGlow', '--inputDefaultBevel']
      }
    },
    {
      state: ['focused'],
      directives: {
        shadow: ['--inputDefaultFocusGlow', '--inputDefaultBevel']
      }
    },
    {
      state: ['focused', 'hover'],
      directives: {
        shadow: ['--inputDefaultFocusGlow', '--inputDefaultHoverGlow', '--inputDefaultBevel']
      }
    },
    {
      state: ['disabled'],
      directives: {
        background: '--parent'
      }
    },
    {
      component: 'Text',
      parent: {
        component: 'Input',
        state: ['disabled']
      },
      directives: {
        textOpacity: 0.25,
        textOpacityMode: 'blend'
      }
    },
    {
      component: 'Icon',
      parent: {
        component: 'Input',
        state: ['disabled']
      },
      directives: {
        textOpacity: 0.25,
        textOpacityMode: 'blend'
      }
    }
  ]
}

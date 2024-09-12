const hoverGlow = {
  x: 0,
  y: 0,
  blur: 4,
  spread: 0,
  color: '--text',
  alpha: 1
}

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
        '--defaultInputBevel': 'shadow | $borderSide(#FFFFFF, bottom, 0.2)| $borderSide(#000000, top, 0.2)'
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
        }, '--defaultInputBevel']
      }
    },
    {
      state: ['hover'],
      directives: {
        shadow: [hoverGlow, '--defaultInputBevel']
      }
    },
    {
      state: ['disabled'],
      directives: {
        background: '$blend(--inheritedBackground, 0.25, --parent)'
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

const border = (top, shadow) => ({
  x: 0,
  y: top ? 1 : -1,
  blur: 0,
  spread: 0,
  color: shadow ? '#000000' : '#FFFFFF',
  alpha: 0.2,
  inset: true
})

const buttonInsetFakeBorders = [border(true, false), border(false, true)]
const inputInsetFakeBorders = [border(true, true), border(false, false)]

const hoverGlow = {
  x: 0,
  y: 0,
  blur: 4,
  spread: 0,
  color: '--text',
  alpha: 1
}

export default {
  name: 'Button',
  selector: '.button',
  states: {
    disabled: ':disabled',
    toggled: '.toggled',
    pressed: ':active',
    hover: ':hover',
    focused: ':focus-within'
  },
  variants: {
    normal: '-default',
    danger: '.danger',
    unstyled: '-unstyled'
  },
  validInnerComponents: [
    'Text',
    'Icon'
  ],
  defaultRules: [
    {
      component: 'Button',
      directives: {
        background: '--fg',
        shadow: [{
          x: 0,
          y: 0,
          blur: 2,
          spread: 0,
          color: '#000000',
          alpha: 1
        }, ...buttonInsetFakeBorders]
      }
    },
    {
      component: 'Button',
      variant: 'unstyled',
      directives: {
        background: '--fg',
        opacity: 0
      }
    },
    {
      component: 'Button',
      state: ['hover'],
      directives: {
        shadow: [hoverGlow, ...buttonInsetFakeBorders]
      }
    },
    {
      component: 'Button',
      state: ['hover', 'pressed'],
      directives: {
        background: '--accent,-24.2',
        shadow: [hoverGlow, ...inputInsetFakeBorders]
      }
    },
    {
      component: 'Button',
      state: ['disabled'],
      directives: {
        background: '$blend(--background, 0.25, --parent)',
        shadow: [...buttonInsetFakeBorders]
      }
    },
    {
      component: 'Text',
      parent: {
        component: 'Button',
        state: ['disabled']
      },
      directives: {
        textOpacity: 0.25,
        textOpacityMode: 'blend'
      }
    }
  ]
}

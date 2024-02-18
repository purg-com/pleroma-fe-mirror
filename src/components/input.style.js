const border = (top, shadow) => ({
  x: 0,
  y: top ? 1 : -1,
  blur: 0,
  spread: 0,
  color: shadow ? '#000000' : '#FFFFFF',
  alpha: 0.2,
  inset: true
})

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
  name: 'Input',
  selector: '.input',
  states: {
    disabled: ':disabled',
    hover: ':hover:not(:disabled)',
    focused: ':focus-within'
  },
  validInnerComponents: [
    'Text'
  ],
  defaultRules: [
    {
      directives: {
        background: '--fg, -5',
        roundness: 3,
        shadow: [{
          x: 0,
          y: 0,
          blur: 2,
          spread: 0,
          color: '#000000',
          alpha: 1
        }, ...inputInsetFakeBorders]
      }
    },
    {
      state: ['hover'],
      directives: {
        shadow: [hoverGlow, ...inputInsetFakeBorders]
      }
    }
  ]
}

export default {
  name: 'Button',
  states: {
    hover: ':hover',
    disabled: ':disabled',
    pressed: ':active',
    toggled: '.toggled'
  },
  variants: {
    danger: '.danger',
    unstyled: '.unstyled',
    sublime: '.sublime'
  },
  validInnerComponents: [
    'Text',
    'Icon'
  ]
}

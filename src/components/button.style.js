export default {
  name: 'Button',
  selector: '.btn',
  states: {
    disabled: ':disabled',
    toggled: '.toggled',
    pressed: ':active',
    hover: ':hover'
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

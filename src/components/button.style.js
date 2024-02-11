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
  name: 'Button', // Name of the component
  selector: '.button', // CSS selector/prefix
  // outOfTreeSelector: '' // out-of-tree selector is used when other components are laid over it but it's not part of the tree, see Underlay component
  // States, system witll calculate ALL possible combinations of those and prepend "normal" to them + standalone "normal" state
  states: {
    // States are a bit expensive - the amount of combinations generated is about (1/6)n^3+n, so adding more state increased number of combination by an order of magnitude!
    // All states inherit from "normal" state, there is no other inheirtance, i.e. hover+disabled only inherits from "normal", not from hover nor disabled.
    // However, cascading still works, so resulting state will be result of merging of all relevant states/variants
    // normal: '' // normal state is implicitly added, it is always included
    disabled: ':disabled',
    toggled: '.toggled',
    pressed: ':active',
    hover: ':hover',
    focused: ':focus-within'
  },
  // Variants are mutually exclusive, each component implicitly has "normal" variant, and all other variants inherit from it.
  variants: {
    // Variants save on computation time since adding new variant just adds one more "set".
    normal: '-default', // you can override normal variant, it will be appenended to the main class
    danger: '-default.danger'
    // Overall the compuation difficulty is N*((1/6)M^3+M) where M is number of distinct states and N is number of variants.
    // This (currently) is further multipled by number of places where component can exist.
  },
  // This lists all other components that can possibly exist within one. Recursion is currently not supported (and probably won't be supported ever).
  validInnerComponents: [
    'Text',
    'Icon'
  ],
  // Default rules, used as "default theme", essentially.
  defaultRules: [
    {
      // component: 'Button', // no need to specify components every time unless you're specifying how other component should look
      // like within it
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
      variant: 'unstyled',
      directives: {
        background: '--fg',
        opacity: 0
      }
    },
    {
      state: ['hover'],
      directives: {
        shadow: [hoverGlow, ...buttonInsetFakeBorders]
      }
    },
    {
      state: ['hover', 'pressed'],
      directives: {
        background: '--accent,-24.2',
        shadow: [hoverGlow, ...inputInsetFakeBorders]
      }
    },
    {
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

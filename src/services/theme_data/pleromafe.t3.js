export const sampleRules = [
  {
    component: 'Underlay',
    // variant: 'normal',
    // state: 'normal'
    directives: {
      background: '#000000',
      opacity: 0.2
    }
  },
  {
    component: 'Panel',
    directives: {
      background: '--fg'
      // opacity: 0.9
    }
  },
  {
    component: 'PanelHeader',
    directives: {
      background: '--fg'
      // opacity: 0.9
    }
  },
  {
    component: 'Button',
    directives: {
      background: '--fg'
      // opacity: 0.8
    }
  },
  {
    component: 'Button',
    state: ['hover'],
    directives: {
      background: '#FFFFFF'
      // opacity: 0.9
    }
  }
]

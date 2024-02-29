export default {
  name: 'Panel',
  selector: '.panel',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Border',
    'Button',
    'ButtonUnstyled',
    'Input',
    'PanelHeader',
    'MenuItem',
    'Post',
    'Notification',
    'Alert',
    'UserCard',
    'Chat',
    'Attachment',
    'Tab',
    'ListItem'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg',
        roundness: 3,
        blur: '5px',
        shadow: [{
          x: 1,
          y: 1,
          blur: 4,
          spread: 0,
          color: '#000000',
          alpha: 0.6
        }]
      }
    }
  ]
}

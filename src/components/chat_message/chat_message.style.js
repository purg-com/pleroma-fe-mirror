export default {
  name: 'ChatMessage',
  selector: '.chat-message',
  variants: {
    outgoing: '.outgoing'
  },
  validInnerComponents: [
    'Text',
    'Icon',
    'Border',
    'Button',
    'RichContent',
    'Attachment',
    'PollGraph'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg, 2',
        backgroundNoCssColor: 'yes'
      }
    },
    {
      variant: 'outgoing',
      directives: {
        background: '--bg, 5'
      }
    }
  ]
}

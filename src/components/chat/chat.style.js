export default {
  name: 'Chat',
  selector: '.chat-message-list',
  lazy: true,
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Avatar',
    'ChatMessage'
  ],
  defaultRules: [
  ]
}

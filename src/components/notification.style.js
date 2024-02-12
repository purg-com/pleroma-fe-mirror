export default {
  name: 'Notification',
  selector: '.Notification',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Border',
    'Button',
    'ButtonUnstyled',
    'RichContent',
    'Input',
    'Avatar'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg'
      }
    }
  ]
}

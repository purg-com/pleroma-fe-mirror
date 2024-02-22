export default {
  name: 'Post',
  selector: '.Status',
  states: {
    selected: '.-focused'
  },
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Border',
    'Button',
    'ButtonUnstyled',
    'RichContent',
    'Input',
    'Avatar',
    'Attachment',
    'PollGraph'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg',
        opacity: 0
      }
    },
    {
      state: ['selected'],
      directives: {
        background: '--inheritedBackground, 10',
        opacity: 1
      }
    }
  ]
}

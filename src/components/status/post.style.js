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
        background: '--bg'
      }
    },
    {
      state: ['selected'],
      directives: {
        background: '--inheritedBackground, 10'
      }
    }
  ]
}

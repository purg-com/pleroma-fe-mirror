export default {
  name: 'Post',
  selector: '.Status',
  validInnerComponents: [
    'Text',
    'Link',
    'Icon',
    'Border',
    'Button',
    'ButtonUnstyled',
    'RichContent',
    'Input'
  ],
  defaultRules: [
    {
      directives: {
        background: '--bg'
      }
    }
  ]
}

export default {
  name: 'Attachment',
  selector: '.Attachment',
  validInnerComponents: [
    'Border',
    'ButtonUnstyled'
  ],
  defaultRules: [
    {
      directives: {
        roundness: 3
      }
    }
  ]
}

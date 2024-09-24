export default {
  name: 'Scrollbar',
  selector: '::-webkit-scrollbar',
  notEditable: true, // for now
  defaultRules: [
    {
      directives: {
        background: '--wallpaper'
      }
    }
  ]
}

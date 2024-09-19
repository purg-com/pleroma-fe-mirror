// this works nearly the same as HTML tree converter
export const deserialize = (input) => {
  const buffer = []
  let textBuffer = ''

  const getCurrentBuffer = () => {
    let current = buffer[buffer.length - 1][1]
    if (current == null) {
      current = { name: null, content: [] }
    }
    buffer.push(current)
    return current
  }

  // Processes current line buffer, adds it to output buffer and clears line buffer
  const flushText = (content) => {
    if (textBuffer === '') return
    if (content) {
      getCurrentBuffer().content.push(textBuffer)
    } else {
      getCurrentBuffer().name = textBuffer
    }
    textBuffer = ''
  }

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (char === ';') {
      flushText(true)
    } else if (char === '{') {
      flushText(false)
    } else if (char === '}') {
      buffer.push({ name: null, content: [] })
      textBuffer = ''
    } else {
      textBuffer += char
    }
  }

  flushText()
  return buffer
}

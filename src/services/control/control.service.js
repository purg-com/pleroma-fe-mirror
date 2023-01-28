const camelCase = name => name.charAt(0).toUpperCase() + name.slice(1)

export const controlledOrUncontrolledGetters = list => list.reduce((res, name) => {
  const camelized = camelCase(name)
  const toggle = `controlledToggle${camelized}`
  const set = `controlledSet${camelized}`
  const controlledName = `controlled${camelized}`
  const uncontrolledName = `uncontrolled${camelized}`
  res[name] = function () {
    return (((this.$data[toggle] !== undefined || this.$props[toggle] !== undefined) && this[toggle]) ||
      ((this.$data[set] !== undefined || this.$props[set] !== undefined) && this[set])
    )
      ? this[controlledName]
      : this[uncontrolledName]
  }
  return res
}, {})

export const controlledOrUncontrolledToggle = (obj, name) => {
  const camelized = camelCase(name)
  const toggle = `controlledToggle${camelized}`
  const uncontrolledName = `uncontrolled${camelized}`
  if (obj[toggle]) {
    obj[toggle]()
  } else {
    obj[uncontrolledName] = !obj[uncontrolledName]
  }
}

export const controlledOrUncontrolledSet = (obj, name, val) => {
  const camelized = camelCase(name)
  const set = `controlledSet${camelized}`
  const uncontrolledName = `uncontrolled${camelized}`
  if (obj[set]) {
    obj[set](val)
  } else {
    obj[uncontrolledName] = val
  }
}

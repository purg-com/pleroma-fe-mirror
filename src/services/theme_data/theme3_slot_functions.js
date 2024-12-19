import { convert, brightness } from 'chromatism'
import { alphaBlend, getTextColor, relativeLuminance } from '../color_convert/color_convert.js'

export const process = (text, functions, { findColor, findShadow }, { dynamicVars, staticVars }) => {
  const { funcName, argsString } = /\$(?<funcName>\w+)\((?<argsString>[#a-zA-Z0-9-,.'"\s]*)\)/.exec(text).groups
  const args = argsString.split(/,/g).map(a => a.trim())

  const func = functions[funcName]
  if (args.length < func.argsNeeded) {
    throw new Error(`$${funcName} requires at least ${func.argsNeeded} arguments, but ${args.length} were provided`)
  }
  return func.exec(args, { findColor, findShadow }, { dynamicVars, staticVars })
}

export const colorFunctions = {
  alpha: {
    argsNeeded: 2,
    exec: (args, { findColor }, { dynamicVars, staticVars }) => {
      const [color, amountArg] = args

      const colorArg = convert(findColor(color, { dynamicVars, staticVars })).rgb
      const amount = Number(amountArg)
      return { ...colorArg, a: amount }
    }
  },
  textColor: {
    argsNeeded: 2,
    exec: (args, { findColor }, { dynamicVars, staticVars }) => {
      const [backgroundArg, foregroundArg, preserve = 'preserve'] = args

      const background = convert(findColor(backgroundArg, { dynamicVars, staticVars })).rgb
      const foreground = convert(findColor(foregroundArg, { dynamicVars, staticVars })).rgb

      return getTextColor(background, foreground, preserve === 'preserve')
    }
  },
  blend: {
    argsNeeded: 3,
    exec: (args, { findColor }, { dynamicVars, staticVars }) => {
      const [backgroundArg, amountArg, foregroundArg] = args

      const background = convert(findColor(backgroundArg, { dynamicVars, staticVars })).rgb
      const foreground = convert(findColor(foregroundArg, { dynamicVars, staticVars })).rgb
      const amount = Number(amountArg)

      return alphaBlend(background, amount, foreground)
    }
  },
  mod: {
    argsNeeded: 2,
    exec: (args, { findColor }, { dynamicVars, staticVars }) => {
      const [colorArg, amountArg] = args

      const color = convert(findColor(colorArg, { dynamicVars, staticVars })).rgb
      const amount = Number(amountArg)

      const effectiveBackground = dynamicVars.lowerLevelBackground
      const isLightOnDark = relativeLuminance(convert(effectiveBackground).rgb) < 0.5
      const mod = isLightOnDark ? 1 : -1
      return brightness(amount * mod, color).rgb
    }
  }
}

export const shadowFunctions = {
  borderSide: {
    argsNeeded: 3,
    exec: (args, { findColor }) => {
      const [color, side, alpha = '1', widthArg = '1', inset = 'inset'] = args

      const width = Number(widthArg)
      const isInset = inset === 'inset'

      const targetShadow = {
        x: 0,
        y: 0,
        blur: 0,
        spread: 0,
        color,
        alpha: Number(alpha),
        inset: isInset
      }

      side.split('-').forEach((position) => {
        switch (position) {
          case 'left':
            targetShadow.x = width * (inset ? 1 : -1)
            break
          case 'right':
            targetShadow.x = -1 * width * (inset ? 1 : -1)
            break
          case 'top':
            targetShadow.y = width * (inset ? 1 : -1)
            break
          case 'bottom':
            targetShadow.y = -1 * width * (inset ? 1 : -1)
            break
        }
      })
      return [targetShadow]
    }
  }
}

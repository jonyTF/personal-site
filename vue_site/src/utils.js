export const restrictMagnitude = (value, magnitude) => {
  if (Math.abs(value) > magnitude) {
    return value > 0 ? magnitude : -magnitude;  
  }
  return value;
}

export const pathCommandsToString = (pathCommands) => {
  let s = '[';
  for (let i = 0; i < pathCommands.length; i++) {
    s += '{'
    let keys = Object.keys(pathCommands[i]);
    console.log(pathCommands[i])
    for (let j = 0; j < keys.length; j++) {
      let key = keys[j]
      s += `"${key}":` 
      let val = pathCommands[i][key];
      if (typeof val === 'string')
        val = `"${val}"`
      s += val
      if (j !== keys.length-1) {
        s += ','
      }
    } 
    s += '}'
    if (i !== pathCommands.length-1)
      s += ','
  }
  s += ']'
  return s
}

export const cmdToPathData = (cmd) => {
  let pathData = '';
  for (let i = 0; i < cmd.length; i++) {
    let s = '';
    for (const val of Object.values(cmd[i])) {
      s += val + ' ';
    }
    pathData += s;
  }
  return pathData;
}

// TODO: maybe turn this into a color class?
export const RgbToColorString = (rgb, alpha=1) => {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export const subtractRgb = (color1, color2) => {
  return {r: color1.r-color2.r, g: color1.g-color2.g, b: color1.b-color2.b}
} 

export const multRgbByConst = (k, rgb) => {
  return {r: k*rgb.r, g: k*rgb.g, b: k*rgb.b}
}
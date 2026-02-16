const fs = require('fs')
const path = require('path')

const fonts = [
  {
    input: './src/assets/fonts/Roboto-Regular.ttf',
    output: './src/assets/fonts/Roboto-Regular.js',
    variable: 'RobotoRegular',
  },
  {
    input: './src/assets/fonts/Roboto-Bold.ttf',
    output: './src/assets/fonts/Roboto-Bold.js',
    variable: 'RobotoBold',
  },
]

fonts.forEach((font) => {
  const fontData = fs.readFileSync(font.input)
  const base64 = fontData.toString('base64')
  const content = `export const ${font.variable} = "data:font/truetype;base64,${base64}";`
  fs.writeFileSync(font.output, content)
  console.log(`Encoded ${font.input} to ${font.output}`)
})

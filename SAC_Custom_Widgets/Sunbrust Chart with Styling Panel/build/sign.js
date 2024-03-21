const fs = require('fs')
const { createHash } = require('crypto')
const path = require('path')

const run = js => {
  const hashSha256 = createHash('sha256')
  const input = fs.createReadStream(path.join(__dirname, '../', js))
  input.on('readable', () => {
    const data = input.read()
    if (data) {
      hashSha256.update(data)
    } else {
      const integrity = `sha256-${hashSha256.digest('base64')}`
      console.log(`${js}: ${integrity}`)
    }
  })
}

[
  'main.js',
  'styling.js'
].forEach(js => run(js))
// main.js: sha256-MeTdl0DMaTJcaQnYlp5Tf96vDT+pdAewY19VdbZOs4Q=
// styling.js: sha256-8AykY9bAoqb0rMOoG3kR6XtPhpLlmKLgIvznx/eeNio=

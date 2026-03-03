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



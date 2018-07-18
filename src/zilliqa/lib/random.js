import assert from 'assert'
import { randomBytes } from 'react-native-randombytes'

/**
 * Generate pseudo-random bytes.
 * @param {Buffer} buf
 * @param {Number} [off=0]
 * @param {Number} [size=buf.length-off]
 * @returns {Buffer}
 */

exports.randomFill = function randomFill(buf, off, size) {
  assert(Buffer.isBuffer(buf))

  if (off == null) off = 0

  assert(off >>> 0 === off)

  if (size == null) size = buf.length - off

  assert(size >>> 0 === size)
  assert(off + size <= buf.length)

  const r = randomBytes(size)
  r.copy(buf, off, 0, r.length)

  return buf
}

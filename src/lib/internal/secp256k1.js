const secp256k1 = require('secp256k1/js')
// const secp256k1 = require('secp256k1/bindings')

secp256k1._bcryptoBinding = false
module.exports = secp256k1

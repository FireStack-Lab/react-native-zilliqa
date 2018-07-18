import { isWebUri } from 'valid-url'
import sha256 from './lib/sha256'
import secp256k1 from './lib/secp256k1'
import Schnorr from './schnorr'

export function intToByteArray(val, paddedSize) {
  const arr = []

  const hexVal = val.toString(16)
  const hexRep = []

  let i
  for (i = 0; i < hexVal.length; i++) {
    hexRep[i] = hexVal[i].toString()
  }

  for (i = 0; i < paddedSize - hexVal.length; i++) {
    arr.push('0')
  }

  for (i = 0; i < hexVal.length; i++) {
    arr.push(hexRep[i])
  }

  return arr
}

export default {
  // generate a new private key using the secp256k1 curve
  // returns a Buffer object,
  generatePrivateKey() {
    return secp256k1.generatePrivateKey()
  },

  // verify if the private key is valid for the secp256k1 curve
  // inputs Buffer and returns true/false
  verifyPrivateKey(privateKey) {
    if (typeof privateKey === 'string') {
      privateKey = new Buffer(privateKey, 'hex')
    }

    return secp256k1.privateKeyVerify(privateKey)
  },

  // get the public address of an account using its private key
  getAddressFromPrivateKey(privateKey) {
    if (typeof privateKey === 'string') {
      privateKey = new Buffer(privateKey, 'hex')
    }

    const pubKey = secp256k1.publicKeyCreate(privateKey, true)
    const pubKeyHash = sha256.digest(pubKey) // sha256 hash of the public key
    const address = pubKeyHash.toString('hex', 12) // rightmost 160 bits/20 bytes of the hash

    return address
  },

  getPubKeyFromPrivateKey(privateKey) {
    if (typeof privateKey === 'string') {
      privateKey = new Buffer(privateKey, 'hex')
    }

    return secp256k1.publicKeyCreate(privateKey, true)
  },

  // construct the transaction json
  // input the privateKey and transaction object
  createTransactionJson(privateKey, txnDetails) {
    if (typeof privateKey === 'string') {
      privateKey = new Buffer(privateKey, 'hex')
    }
    const pubKey = secp256k1.publicKeyCreate(privateKey, true)

    const txn = {
      version: txnDetails.version,
      nonce: txnDetails.nonce,
      to: txnDetails.to,
      amount: txnDetails.amount,
      pubKey: pubKey.toString('hex'),
      gasPrice: txnDetails.gasPrice,
      gasLimit: txnDetails.gasLimit,
      code: txnDetails.code || '',
      data: txnDetails.data || ''
    }

    const codeHex = new Buffer(txn.code).toString('hex')
    const dataHex = new Buffer(txn.data).toString('hex')

    const msg =
      intToByteArray(txn.version, 64).join('') +
      intToByteArray(txn.nonce, 64).join('') +
      txn.to +
      txn.pubKey +
      intToByteArray(txn.amount, 64).join('') +
      intToByteArray(txn.gasPrice, 64).join('') +
      intToByteArray(txn.gasLimit, 64).join('') +
      intToByteArray(txn.code.length, 8).join('') + // size of code
      codeHex +
      intToByteArray(txn.data.length, 8).join('') + // size of data
      dataHex

    // sign using schnorr lib
    const schnorr = new Schnorr()

    const messageHex = new Buffer(msg, 'hex')

    const sig = schnorr.sign(messageHex, privateKey, pubKey)

    let r = sig.r.toString('hex')
    let s = sig.s.toString('hex')
    while (r.length < 64) {
      r = `0${r}`
    }
    while (s.length < 64) {
      s = `0${s}`
    }
    txn.signature = r + s

    return txn
  },

  // make sure each of the keys in requiredArgs is present in args
  // and each of it's validator functions return true
  validateArgs(args, requiredArgs, optionalArgs) {
    for (var key in requiredArgs) {
      if (args[key] === undefined) throw new Error(`Key not found: ${key}`)

      for (var i = 0; i < requiredArgs[key].length; i++) {
        if (typeof requiredArgs[key][i] !== 'function')
          throw new Error('Validator is not a function')

        if (!requiredArgs[key][i](args[key]))
          throw new Error(`Validation failed for ${key}`)
      }
    }

    for (var key in optionalArgs) {
      if (args[key]) {
        for (var i = 0; i < optionalArgs[key].length; i++) {
          if (typeof optionalArgs[key][i] !== 'function')
            throw new Error('Validator is not a function')

          if (!optionalArgs[key][i](args[key]))
            throw new Error(`Validation failed for ${key}`)
        }
      }
    }
    return true
  },

  isAddress(address) {
    return !!address.match(/^[0-9a-fA-F]{40}$/)
  },

  isPrivateKey(privateKey) {
    return !!privateKey.match(/^[0-9a-fA-F]{64}$/)
  },

  isPubkey(pubkey) {
    return !!pubkey.match(/^[0-9a-fA-F]{66}$/)
  },

  isUrl(url) {
    return isWebUri(url)
  },

  isHash(txHash) {
    return !!txHash.match(/^[0-9a-fA-F]{64}$/)
  },

  isNumber(number) {
    return typeof number === 'number'
  },

  isString(string) {
    return typeof string === 'string'
  }

  // convert number to array representing the padded hex form
}

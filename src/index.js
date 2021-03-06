import Node from './node'
import util from './util'
import Schnorr from './schnorr'
import config from './config'

const { validateArgs } = util

class Zilliqa {
  constructor(args) {
    validateArgs(args, {}, { nodeUrl: [util.isUrl] })
    this.version = config.version
    this.node = new Node({ url: args.nodeUrl || config.defaultNodeUrl })
    this.schnorr = new Schnorr()
    this.util = util
    this.data = {}
  }

  getLibraryVersion = () => this.version

  isConnected = () => this.node && this.node.isConnected()

  getNode = () => this.node

  setNode = args => {
    validateArgs(args, {
      nodeUrl: [util.isUrl]
    })
    this.node = new Node({ url: args.nodeUrl || config.defaultNodeUrl })
    return null
  }
}

export default Zilliqa

'use strict'

const Base = require('lowdb/adapters/Base')
const Ipfs = require('ipfs')
const crypto = require('crypto')
const algorithm = 'aes-192-cbc'

class IPFSAdapter extends Base {
  constructor (ipfs, lastHash, key, iv) {
    super('ipfs')
    this.key = key || null
    this.iv = iv || Buffer.alloc(16, 0)
    this.lastHash = lastHash || null
    this.ipfs = ipfs
    if (this.lastHash) this.defaultValue = this.read()
  }

  read () {
    if (!this.lastHash) return {}
    return this.ipfs
      .get(this.lastHash)
      .then(results => {
        const data = this.key
          ? this.decrypt(results[0].content.toString('utf8'))
          : results[0].content.toString('utf8')
        return this.deserialize(data)
      })
      .catch(error => error)
  }

  write (data) {
    return new Promise((resolve) => {
      let dataSerialized = null
      data._parentHash = this.lastHash
      const serialized = this.serialize(data)
      dataSerialized = Ipfs.Buffer.from(
        this.key ? this.encrypt(serialized) : serialized
      )
      this.ipfs
        .add(dataSerialized)
        .then((results) => { resolve(results[0].hash); this.lastHash = results[0].hash })
    })
  }

  encrypt (data) {
    const cipher = crypto.createCipheriv(algorithm, this.key, this.iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted.toString()
  }

  decrypt (data) {
    const decipher = crypto.createDecipheriv(algorithm, this.key, this.iv)
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted.toString()
  }
}

module.exports = IPFSAdapter

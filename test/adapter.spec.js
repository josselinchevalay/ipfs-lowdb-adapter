'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const os = require('os')
const path = require('path')
const hat = require('hat')
const IPFS = require('ipfs');
const IPFSAdapter = require('../index')
const crypto = require('crypto')
const obj = { a: 1, _parentHash: null }
const password = 'mySecretTest'
const salt = 'MySalt'
const keyLength = 24


let getIPFSConfig = () => {
  return {
    repo: path.join(os.tmpdir(), 'ipfs-repo-' + hat()),
    init: { bits: 512 },
    config: {
      Addresses: {
        Swarm: []
      }
    },
    preload: { enabled: false }
  }
}

describe('test', () => {

    it('should read and write', function (done) {
        this.timeout(80 * 1000)    
        const node = new IPFS(getIPFSConfig())    
        node.once('start', (err) => {          
          const adapter = new IPFSAdapter(node)
          expect(err).to.not.exist()
          let dataEmpty = adapter.read()
          expect(dataEmpty).to.exist()
          adapter.write(obj).then( lastHash => {
            expect(adapter.lastHash).to.eq(lastHash);
            adapter.read().then((data) => {
              expect(data).to.deep.eq(obj)
              node.once('stop', done)
              node.stop()
            }).catch(error => console.log(error))
          }).catch(error => console.log(error))       
        })
    })

   it('should read and write with key', function (done) {
      this.timeout(80 * 1000)

      const node = new IPFS(getIPFSConfig())    
        node.once('start', (err) => {
          expect(err).to.not.exist()
          const key = crypto.scryptSync(password, salt, keyLength)
          const adapter = new IPFSAdapter(node, null, key)
          expect(adapter.read()).to.deep.eq({})
          adapter.write(obj).then(lastHash => {
            expect(lastHash).to.eq(adapter.lastHash);
            adapter.read().then( data => {
              expect(data).to.deep.equal(obj)
              node.once('stop', done)
              node.stop()
            }).catch(error => console.log(error))
          }).catch(error => console.log(error))
        })
    })
});
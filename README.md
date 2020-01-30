# ipfs-lowdb-adapter
Ipfs LowDb Adapter


Permit to persist your lowDb database on IPFS with or without crypt. 

[![Build Status](https://travis-ci.com/josselinchevalay/ipfs-lowdb-adapter.svg?branch=master)](https://travis-ci.com/josselinchevalay/ipfs-lowdb-adapter)

# How to use

install package `npm i ipfs-lowdb-adapter lowdb ipfs`

in your code 

```js
const IPFS = require('ipfs')
const Low = require('lowdb')
const IPFSAdapter = require('ipfs-lowdb-adapter')

(async() => {
    const node = await IPFS.create()
    const adapter = new IPFSAdapter(node)
    const db = new Low(adapter)

    // you can use lowDb on ipfs
})();
```

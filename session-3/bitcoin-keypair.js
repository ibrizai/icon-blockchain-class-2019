const bitcoin = require('bitcoinjs-lib')
const TestNet = bitcoin.networks.testnet


let keyPair = bitcoin.ECPair.makeRandom({ network: TestNet })
console.log(keyPair)
console.log('public key :' + Buffer.from(keyPair.publicKey).toString('hex'))
Buffer.from(keyPair.publicKey).toString('hex')
console.log('private key : ' + Buffer.from(keyPair.privateKey).toString('hex'))
console.log('private key WIF: ' + keyPair.toWIF())
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey ,network:TestNet })
console.log('address: '+address) 

// get some test bitcoin



//create a sending wallet 




//Do a send transaction


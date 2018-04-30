// Allows us to use ES6 in our migrations and tests.
require('babel-register')

var HDWalletProvider = require('truffle-hdwallet-provider')
var mnemonic = ''


module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/')
      },
      network_id: 1,
      gasPrice: 6000000000
    } 
  }
};
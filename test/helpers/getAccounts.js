const { promisify } = require('es6-promisify')
require('babel-polyfill')

module.exports = async (web3) => promisify(web3.eth.getAccounts)()
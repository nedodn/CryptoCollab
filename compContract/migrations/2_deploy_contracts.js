var Opus = artifacts.require("./Opus.sol");

module.exports = function(deployer) {
  deployer.deploy(Opus, 1512927158, 1513272758);
};
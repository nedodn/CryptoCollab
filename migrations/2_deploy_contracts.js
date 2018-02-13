var CompositionPart = artifacts.require("./CompositionPart.sol");
var NoteToken = artifacts.require("./NoteToken.sol");

module.exports = function(deployer) {
  deployer.deploy(NoteToken,1546224959)
  .then(() => NoteToken.deployed())
  .then(instance => deployer.deploy(CompositionPart,1546224959,instance.address))
};

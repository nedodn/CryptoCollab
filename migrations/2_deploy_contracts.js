var Opus= artifacts.require("./Opus.sol");

module.exports = function(deployer) {
  deployer.deploy(Opus, 1514678400);
};

const FaucetContract = artifacts.require("./Faucet.sol");

module.exports = function(deployer) {

    //passing all these params for now as ethereum doesn't handle floating or fixed point very well right now
    deployer.deploy(FaucetContract, true)

};

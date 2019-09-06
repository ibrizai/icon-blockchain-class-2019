
const TechFlow = artifacts.require("./TechFlow.sol");
const config  = require ('../utils/CommonConst.json');

module.exports = function(deployer, network) {

  if (network == "live") {
      // Do something specific to the network named "live".
      console.log('push to live !!!')
  } else if (network == "development") {
    deployer.then(async () =>{
      let accounts = await web3.eth.getAccounts();
      let teamAddress = accounts[1];
      let publicSaleAddress = accounts[2];
      let foundationAddress = accounts[3];
      
      console.log('accounts :' + accounts);
      console.log('teamAddress :' + teamAddress);

      await deployer.deploy(TechFlow,config.name, config.symbol, config.decimals,
        teamAddress, publicSaleAddress, foundationAddress);
    })

  } else {
    console.log('Do not understand the newwork to push to !!')
  }

};

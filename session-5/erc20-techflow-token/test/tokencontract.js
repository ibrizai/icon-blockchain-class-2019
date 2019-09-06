const TechFlow = artifacts.require('TechFlow');
const config  = require ('../utils/CommonConst.json');

module.exports =  (accounts) => {
  return TechFlow.new(config.name,
      config.symbol,
      config.decimals,
      accounts[1],   // teamAddress
      accounts[2],   // publicSaleAddress
      accounts[3]);   // foundationAddress
}

const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const config  = require ('../utils/CommonConst.json');
const testConst = require('./testconstants');

const tokenContract = require('./tokencontract');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();


contract("TechFlow", accounts => {
  beforeEach(async function () {
    this.token = await tokenContract(accounts);
    this.transferAmount= new BN(1000000);
    this.owner = await this.token.owner();
    this.publicSaleAddress = accounts[2];  //2nd address passed to the constructor
  });

  describe('buyTokens from public sale  ', function() {

    it('buyTokens from non publicSaleAddress should fail', async function(){

      await shouldFail.reverting(this.token.buyTokens(accounts[6], this.transferAmount, '0x0', '0x0', { from: this.owner }));
      await shouldFail.reverting(this.token.buyTokens(accounts[6], this.transferAmount, '0x0', '0x0', { from: accounts[1] }));
      await shouldFail.reverting(this.token.buyTokens(accounts[6], this.transferAmount, '0x0', '0x0', { from: accounts[3] }));

    })

    it('buyTokens from publicSaleAddress should pass', async function(){
      const {logs } =  await this.token.buyTokens(accounts[6], this.transferAmount, '0x0', '0x0', { from: this.publicSaleAddress });
      expectEvent.inLogs(logs, 'Transfer', { from: this.publicSaleAddress, to: accounts[6], value: this.transferAmount });
      (await this.token.balanceOf(accounts[6])).should.be.bignumber.equal(this.transferAmount);
      (await this.token.balanceOf(this.publicSaleAddress)).should.be.bignumber.equal(testConst.publicSaleSupply.sub(this.transferAmount));

    });

  });

});

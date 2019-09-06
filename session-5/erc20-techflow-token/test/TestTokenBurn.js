const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const config  = require ('../utils/CommonConst.json');
const testConst = require('./testconstants');

const tokenContract = require('./tokencontract');

//const BN = require('bn.js');
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("TechFlow", accounts => {

  beforeEach(async function () {
    this.token = await tokenContract(accounts);
    this.burnAmount = new BN(1000000000);
    this.owner = await this.token.owner();
  });

  describe('burn ', function() {

    it("match initial supply", async function() {
          (await this.token.totalSupply()).should.be.bignumber.equal(testConst.totalSupply);
    });

    it("burn should revert when not enough to burn", async function() {
      // owner address is empty when scripot launched.
      await shouldFail.reverting(this.token.burn(this.burnAmount, { from: this.owner }));
    });

    it('burn should fail on account different from owner account' , async function() {
      //burn can only happen from owner address
      await shouldFail.reverting(this.token.burn(this.burnAmount, { from: accounts[1] }));
    });

    it('transfer to owner should succeed', async function() {
      let originalSenderBalance = await this.token.balanceOf(accounts[1]);
      //transfer some to owner address  and then burn
      await this.token.transfer(this.owner, this.burnAmount,{ from: accounts[1]});
      (await this.token.balanceOf(this.owner)).should.be.bignumber.equal(this.burnAmount);
      //check that sender's account is debited
      (await this.token.balanceOf(accounts[1])).should.be.bignumber.equal(originalSenderBalance.sub(this.burnAmount));


    });

    //accounts resets on every it()
    it('burn should only work from owner address' , async function() {
      await this.token.transfer(this.owner, this.burnAmount,{ from: accounts[1]});

      let ownerBalance = await this.token.balanceOf(this.owner);
      let teamBalance = await this.token.balanceOf(accounts[1]);
      const {logs } = await this.token.burn(this.burnAmount, { from: this.owner });
      (await this.token.balanceOf(this.owner)).should.be.bignumber.equal('0');
      (await this.token.totalSupply()).should.be.bignumber.equal(testConst.totalSupply.sub(this.burnAmount));
      //check that transfer event happened  -- not working with some filter error
      expectEvent.inLogs(logs, 'Transfer', { from: this.owner, to: constants.ZERO_ADDRESS, value: this.burnAmount });

    });

    it('Burn should work from new owner', async function(){
      let {logs} = await this.token.transferOwnership(accounts[6]);
      expectEvent.inLogs(logs, 'OwnershipTransferred', { previousOwner: this.owner, newOwner: accounts[6] });

      //now do a burn from new owner

      let newOwner = await this.token.owner();
      console.log('newOwner :' + newOwner);
      let newlogs = await this.token.transfer(newOwner, this.burnAmount,{ from: accounts[1]});
      expectEvent.inLogs(newlogs.logs, 'Transfer', { from: accounts[1], to: newOwner  , value: this.burnAmount });
      (await this.token.balanceOf(newOwner)).should.be.bignumber.equal(this.burnAmount);
      let burnLogs  = await this.token.burn(this.burnAmount, { from: newOwner });
      (await this.token.balanceOf(newOwner)).should.be.bignumber.equal('0');
      (await this.token.totalSupply()).should.be.bignumber.equal(testConst.totalSupply.sub(this.burnAmount));
      expectEvent.inLogs(burnLogs.logs, 'Transfer', { from: newOwner, to: constants.ZERO_ADDRESS, value: this.burnAmount });



    });
  });

});

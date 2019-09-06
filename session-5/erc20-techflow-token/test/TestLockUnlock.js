const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const config  = require ('../utils/CommonConst.json');

const tokenContract = require('./tokencontract');


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("TechFlow", accounts => {

  beforeEach(async function () {
    this.token = await tokenContract(accounts);

    this.owner = await this.token.owner();
    this.transferAmount= new BN(1000000);
  });

  describe('Lock Unlock should function  as below  ', function() {

    it('Lock of owner address should fail', async function(){
        await shouldFail.reverting(this.token.lockAccount(this.owner, { from: this.owner }));
    });

    it('Lock call from anyone other than owner should fail ', async function(){
        await shouldFail.reverting(this.token.lockAccount(accounts[3], { from: accounts[1] }));
        await shouldFail.reverting(this.token.lockAccount(accounts[3], { from: accounts[2] }));
    });

    it('Lock call from owner should work ', async function(){
        // transfer some to accounts[6] and Lock it
        await this.token.transfer(accounts[6], this.transferAmount,{ from: accounts[1]});
        (await this.token.balanceOf(accounts[6])).should.be.bignumber.equal(this.transferAmount);

        const {logs } =  await this.token.lockAccount(accounts[6], {  from: this.owner });

        expectEvent.inLogs(logs, 'LockedAccount', { _targetAddress: accounts[6]});

        //now tranfer from locked account should shouldFail
        await shouldFail.reverting(this.token.transfer(accounts[7], new BN(1000),{ from: accounts[6]}));

        (await this.token.balanceOf(accounts[7])).should.be.bignumber.equal(new BN(0));

        //check that account locked is locked state
        assert.equal(await this.token.isAddressLocked(accounts[6]), true, 'Should be in locked state');

        await this.token.unlockAccount(accounts[6], {  from: this.owner });
        //expectEvent.inLogs(unlockLogs, 'UnlockedAccount', { _targetAddress: accounts[6]});
        assert.equal(await this.token.isAddressLocked(accounts[6]), false, 'Should NOT be in locked state');

        //transger should work
        const {xferLogs} = await this.token.transfer(accounts[7], new BN(1000),{ from: accounts[6]});
        (await this.token.balanceOf(accounts[7])).should.be.bignumber.equal(new BN(1000));
        console.log(xferLogs);

    });

    it('Unlock should emit event ', async function() {
        await this.token.lockAccount(accounts[6], {  from: this.owner });

        const {logs } =  await this.token.unlockAccount(accounts[6], {  from: this.owner });
        expectEvent.inLogs(logs, 'UnlockedAccount', { _targetAddress: accounts[6]});
    });

});

});

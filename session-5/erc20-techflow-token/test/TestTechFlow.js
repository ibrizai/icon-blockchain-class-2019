const { shouldFail } = require('openzeppelin-test-helpers');

const testConst = require('./testconstants');
const config  = require ('../utils/CommonConst.json');
const tokenContract = require('./tokencontract');

const BN = require('bn.js');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('TechFlow', accounts => {

  beforeEach(async function () {
    this.token = await tokenContract(accounts);
  });

  describe('token attributes', function() {
    it('has correct name', async function(){
      const name = await this.token.name();
      name.should.equal(config.name);
    });

    it('has correct symbol', async function(){
      const symbol = await this.token.symbol();
      symbol.should.equal(config.symbol);
    });

    it('has correct decimals', async function(){
      const decimals = await this.token.decimals();
      decimals.should.be.a.bignumber.that.equals(config.decimals);
    });

    it('has correct totalSupply', async function(){
      const totalSupply = await this.token.totalSupply();
      testConst.totalSupply.eq(totalSupply);
    });

    it('has correct teamSupply', async function(){
      const teamSupply = await this.token.balanceOf( accounts[1]);
      testConst.teamSupply.eq(teamSupply);
    });

    it('has correct publicSaleSupply', async function(){
      const publicSaleSupply = await this.token.balanceOf( accounts[2]);
      testConst.publicSaleSupply.eq(publicSaleSupply);
    });

    it('has correct foundationSupply', async function(){
      const foundationSupply = await this.token.balanceOf( accounts[3]);
      testConst.foundationSupply.eq(foundationSupply);
    });

    it('should deploy token with paused as false', async function() {
        assert.equal(await this.token.paused(), false, 'paused should be initialized to false');
    });

    it('should fail to transfer this token to this contract address', async function() {
      await shouldFail.reverting(this.token.transfer( this.token.address, new BN(1000000),{ from: accounts[1]}));
    });
  });

});

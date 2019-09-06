
### Install
1. Go to session-5/erc20-techflow-token folder
2. Run npm Install
3. Fire of Ganache
4. run ```truffle migrate --reset```
5. run ```truffle test```


#to flatten to deployt via remix
truffle-flattener contracts/TechFlow.sol > flattened/FlattenedTechFlow.sol



*** truffle console ***
```
 TechFlow.deployed().then((instance) => { techflow= instance })
 techflow.address
 techflow.name()
 techflow.symbol()
 ```

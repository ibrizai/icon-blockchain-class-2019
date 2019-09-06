import Web3 from 'web3';

((web3Demo) => {
    let contractInstance;
    let ethereum;
    let web3;
    const contractAddress = "0x50b3a7df61fd3d5afa83aeffadb272e33f11e76f";
    const privateKey = "0xFFA1A81514D6ABDD33DA5242356E993FCF5C1557800B62BDB9D96D536285F42B";
    let activeWallet;
    web3Demo.web3Init = () => {
        // if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
        //     console.log("Web3 Not found")
        // }
        // else {
        web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"))
        contractInstance = new web3.eth.Contract(abi, contractAddress);
        web3Demo.getWallet();
        // }
    }
    web3Demo.getBalance = (activeWallet) => {
        return web3.eth.getBalance(activeWallet);
    };


    web3Demo.getWallet = async () => {
        const wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
        activeWallet = wallet.address;
        document.getElementById("activeWallet").innerText = activeWallet;
        console.log(wallet)
        document.getElementById("activeContract").innerText = contractAddress;
        const balance = await web3Demo.getBalance(activeWallet);
        document.getElementById("activeBalance").innerText = web3.utils.fromWei(balance) + " ETH";
        const tokenBalance = await  web3Demo.getTokenBalance(activeWallet);
        console.log(tokenBalance)
        document.getElementById("contractBalance").innerText = web3.utils.fromWei(tokenBalance.toString());

    }

    web3Demo.getTokenBalance = (activeWallet) => {
        return contractInstance.methods.balanceOf(activeWallet).call();

    }
    web3Demo.sendETH = async () => {
        const amount = document.getElementById("txtETHAmount").value;
        const receiverAddress = document.getElementById("txtETHAddress").value;
        const txnObj = await  web3.eth.accounts.signTransaction({
            to: receiverAddress,
            value: web3.utils.toHex(web3.utils.toWei(amount)),
            gas: web3.utils.toHex(210000),
            gasPrice: web3.utils.toHex(21 * Math.pow(10, 9)),
            data : web3.utils.toHex(" hello world")
        }, privateKey)
        if (txnObj)
            alert(`Transaction has been send with Txn hash : ${txnObj.transactionHash}`)
        web3.eth.sendSignedTransaction(txnObj.rawTransaction)
            .then( (res) => {
                console.log(res)
        // alert(`Transaction has been confirmed with Txn hash : ${res.transactionHash}`)
         });

    }

    web3Demo.sendToken = () => {

        let contractData;
        const fromAddress = activeWallet;
        const toAddress = document.getElementById("txtETHAddress2").value
        const tokenAmount = web3.toHex(document.getElementById("txtETHAmount2").value * Math.pow(10, 18))
        const data = contractInstance.transfer.getData(toAddress, tokenAmount);
        Promise.all([web3Demo.estimateGas(data), web3Demo.gasPrice()])
            .then(response => {
                const params = [{
                    "from": activeWallet,
                    "to": contractAddress,
                    "gas": web3.toHex(response[0]),
                    "gasPrice": web3.toHex(response[1].toString(10)),
                    "value": 0,
                    data: data
                }];

                ethereum.sendAsync({
                    method: 'eth_sendTransaction',
                    params: params,
                    from: activeWallet,
                }, (err, res) => {
                    if (!err)
                        alert(`Congratulation, Token is Sent with Tx Hash : ${res.result}`)
                })
            })
    }

    web3Demo.estimateGas = (data) => {
        return new Promise((resolve, reject) => {
            web3.eth.estimateGas({to: contractAddress, data}, (err, res) => {
                if (!err)
                    return resolve(res);
            })
        })
    }
    web3Demo.gasPrice = () => {
        return new Promise((resolve, reject) => {
            web3.eth.getGasPrice((err, res) => {
                if (!err)
                    return resolve(res);
            })
        })
    }

    web3Demo.web3Init();

})
(web3Demo);


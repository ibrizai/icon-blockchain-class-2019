((web3Demo) => {
    let contractInstance;
    let ethereum;
    let web3;
    const contractAddress = "0x50b3a7df61fd3d5afa83aeffadb272e33f11e76f"
    let activeWallet;
    web3Demo.web3Init = () => {
        if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
            ethereum = window.ethereum;
            web3 = window.web3;
            ethereum.enable();
            const provider = window['ethereum'] || window.web3.currentProvider;
            const contract = web3.eth.contract(abi);
            contractInstance = contract.at(contractAddress);
            console.log(contractInstance)
            web3Demo.getWallet();
            web3Demo.watchEvent();
        }
    }
    web3Demo.getBalance = (activeWallet) => {
        web3.eth.getBalance(activeWallet, (err, balance) => {
            if (!err)
                document.getElementById("activeBalance").innerText = web3.fromWei(balance) + " ETH";
            else
                aler(err)
        })
    };


    web3Demo.getWallet = () => {
        activeWallet = ethereum.selectedAddress;
        document.getElementById("activeWallet").innerText = activeWallet;
        document.getElementById("activeContract").innerText = contractAddress;
        web3Demo.getBalance(activeWallet);
        web3Demo.getTokenBalance(activeWallet);
    }

    web3Demo.getTokenBalance = (activeBalance) => {
        contractInstance.balanceOf(activeBalance, (err, balance) => {
            if (!err) {

                document.getElementById("contractBalance").innerText = web3.fromWei(balance) + " MT";

            }
        })

    }
    web3Demo.sendETH = () => {

        const params = [{
            "from": activeWallet,
            "to": document.getElementById("txtETHAddress").value,
            "gas": web3.toHex(21000),
            "gasPrice": web3.toHex(21 * Math.pow(10, 9)),
            "value": web3.toHex(document.getElementById("txtETHAmount").value * Math.pow(10, 18)),
            "data":web3.toHex("hello world")
        }];
        console.log(params)

        ethereum.sendAsync({
            method: 'eth_sendTransaction',
            params: params,
            from: activeWallet

        }, (err, res) => {
            if (!err)
                alert(`Congratulation, ETH is Sent with Tx Hash : ${res.result}`)

        })


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
    web3Demo.watchEvent = () => {
        contractInstance.Transfer((err, result) => {
            if (!err)
                alert(`Transaction confirmed for Tx Hash :`);
        });
    }
    web3Demo.web3Init();

})(web3Demo);


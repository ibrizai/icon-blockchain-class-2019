const bitcoin = require('bitcoinjs-lib');
const TestNet = bitcoin.networks.testnet;
const rp = require("request-promise");


const getUTXO = (address) => {
    try {

        /* Get the UTXOS */

        const options = {
            uri: "https://chain.so/api/v2/get_tx_unspent/BTCTEST/" + address,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json"
            }
        }

        return rp(options);
    }
    catch (e) {
        throw e;
    }
}


const sendBitcoin = async (toAddress) => {
    try {
        let fixedFee = 0.000001 * Math.pow(10, 8);  /* Convert to Satoshis */


        const senderAddress = "mmLoHeQPBuejwaNgNJ4umEefDH5fhmahVC";
        const senderWif = "cQdSzKvXUCnY4szGvojYdSaU1PrdymrceZzzcWL446t5CUtSMWHT";
        const privateKey = "5aecec44e13839d7f8ae5943991aa21c60c8f45aaa74f39fd78ee45626c5f27b";


        let utxo = await getUTXO(senderAddress);
        const amountToBeSent = 0.0001;
        let amountToOutput = +(amountToBeSent) * Math.pow(10, 8);  /* Convert to Satoshis */
        let unspentAmount = 0;
        let txb = new bitcoin.TransactionBuilder(TestNet);
        const pk = new bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"), {network: TestNet});
        let estimatedFeePerKb = fixedFee;
        let payingFee = estimatedFeePerKb;
        let usedInput = 0;

        /* Check if there is UTXOS */

        if (utxo.data && !utxo.data.txs.length > 0) {
            throw new Error("no UTXOS !!!!")
        }
        utxo.data.txs.every((unspent, index) => {

            /* Use the number of Output Txn form the UTXOS as Input for new Txn from the sending Address*/

            txb.addInput(unspent.txid, unspent.output_no);
            unspentAmount += +unspent.value * Math.pow(10, 8);  /* Convert to Satoshis */
            usedInput++;
            /* SUM the needed amount from the UTXOS for sending amount plus FEE */
            /* Only use the necessary number of inputs from the UTXOS */
            const totalRemainingAmount = unspentAmount - (amountToOutput + fixedFee);
            if (totalRemainingAmount > 0) {
                return false
            } else return true
        })


        /* Check the balance of the sending address */

        if (amountToOutput + fixedFee < unspentAmount) {

            /* Add output for the Transaction with receiving address and amount to be send */

            txb.addOutput(toAddress, amountToOutput);
            /* Sending amount is less than the balance of sender address , so the rest should go back to sender */
            const changeAmount = unspentAmount - (amountToOutput + fixedFee);
            /* Add the  change transaction as the output to same address */
            txb.addOutput(senderAddress, changeAmount);
        } else {

            throw new Error("Not enough balance.");
        }


        /* Sign every input using the private key */

        for (let c = 0; c < usedInput; c++) {
            txb.sign(c, pk);
        }

        /* Create the Transaction object and convert to HEX */
        const body = {
            tx_hex: txb.build().toHex()
        }

        /* Broadcast the transaction to the bitcoin blockchain node */

        const options = {
            uri: "https://chain.so/api/v2/send_tx/BTCTEST",
            method: "POST",
            body,
            json: true,
            headers: {
                "content-type": "application/json"
            }
        }
        /* Receive the Txn Hash  */
        const broadcastTx = await rp(options);
        console.log(broadcastTx)
        return broadcastTx;


    } catch (e) {
        throw e;
    }
}

sendBitcoin("2N4JmPDCW7EpEpDcrcYxLFzJPvzwyQCau2Y"); // sender Address
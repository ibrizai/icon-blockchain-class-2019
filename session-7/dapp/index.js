"use strict";

import IconService, {IconConverter, HttpProvider, IconBuilder} from 'icon-sdk-js';

((pollingController) => {
    let iconService = {};
    let activeWallet = "";
    let pollTransaction = false;
    const scoreAddress = "cxb38654d0c6571e6906b1cd1331bca3291223a857";
    const networkId = "0x3"; /*"0x3"*/
    pollingController.init = () => {
        // const httpProvider = new HttpProvider('https://bicon.net.solidwallet.io/api/v3');
        // const httpProvider = new HttpProvider('https://ctz.solidwallet.io/api/v3');
        const httpProvider = new HttpProvider('http://localhost:9000/api/v3');
        iconService = new IconService(httpProvider);

        window.onload = () => {
            var eventHandler = event => {
                var {type, payload} = event.detail;
                switch (type) {
                    case "RESPONSE_ADDRESS":
                        activeWallet = payload;
                        if (pollTransaction) {
                            pollTransaction = false;
                            pollingController.poll();
                        } else {
                            pollingController.getMyPoll();
                        }
                        break;

                    case "RESPONSE_JSON-RPC":
                        pollingController.getAllPoll();
                        break;

                }


            }
            window.addEventListener('ICONEX_RELAY_RESPONSE', eventHandler);
        }

        pollingController.getAllPoll();

    };


    pollingController.checkWallet = () => {
        const customEvent = new CustomEvent('ICONEX_RELAY_REQUEST', {
            detail: {
                type: 'REQUEST_ADDRESS'
            }
        });
        window.dispatchEvent(customEvent);
    }

    pollingController.getBalance = () => {
        return iconService.getBalance(activeWallet).execute()
    }

    pollingController.poll = async (e) => {
        pollTransaction = true;
        // activeWallet = "hxa87bab9e2f5608de943aec0abb9dcb6b7b246988";
        if (!activeWallet) {
            pollingController.checkWallet();
        } else {
            var polledValue = document.querySelector("input[name='winnerRadio']:checked").value;
            let balance = await pollingController.getBalance();
            balance = IconConverter.toNumber(balance);
            if (balance > 0) {
                const customEvent = new CustomEvent("ICONEX_RELAY_REQUEST", {
                    detail: {
                        type: "REQUEST_JSON-RPC",
                        payload: {
                            jsonrpc: "2.0",
                            method: "icx_sendTransaction",
                            id: 1234,
                            params: {
                                version: "0x3",
                                from: activeWallet,
                                to: scoreAddress,
                                timestamp: IconConverter.toHex(
                                    new Date().getTime() * 1000
                                ),
                                nid: networkId,
                                stepLimit: IconConverter.toNumber("2000000"),
                                dataType: "call",
                                data: {
                                    "method": "vote",
                                    "params": {
                                        "_vote": polledValue
                                    }
                                }
                            }
                        }
                    }
                });
                window.dispatchEvent(customEvent);
            } else {
                alert("Not Enough Balance")
            }
        }


    }

    pollingController.getMyPoll = async () => {
        if (!activeWallet) {
            pollingController.checkWallet();
        } else {
            const myPollCallBuilder = new IconBuilder.CallBuilder()
                .from(activeWallet)
                .to(scoreAddress)
                .method('recent_vote')
                .build();
            const result = await iconService.call(myPollCallBuilder).execute();
            if (IconService.IconHexadecimal.remove0xPrefix(result) != 0) {
                alert(`You have recently voted  ${result == 1 ? "Yes" : "No"}`);
            } else {
                alert("You have not voted yet, please vote now");
            }
        }
    }


    pollingController.getAllPoll = async () => {

        const allPollCallBuilder = new IconBuilder.CallBuilder()
            .to(scoreAddress)
            .method('get_vote_count')
            .build();
        const result = await iconService.call(allPollCallBuilder).execute();
        if (result)
            pollingController.drawChart(result)
    }

    pollingController.drawChart = (pollResult) => {
        document.getElementById("totalVotes").innerText = +pollResult.yes_count + +pollResult.no_count;
        var ctx = document.getElementById("myChart").getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Yes", "No"],
                datasets: [{
                    label: '# ICON Blockchain Pole',
                    data: [pollResult.yes_count, pollResult.no_count],
                    backgroundColor: [

                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)'

                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255,99,132,1)',

                    ],
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: true
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
    pollingController.help = () => {
        Swal.fire({
            title: '<strong> Help !!!! </strong>',
            type: 'info',
            html:
                `<div style="text-align:left">
          <p>This is a simple polling application created on ICON blockchain.
          Main idea behind this app is to utilize the immutability and openness
          of the blockchain allowing for a fair and open polling process.` +
                `<p>To Participate in polling you need <b>ICONex</b> wallet and some <b>ICX</b>. 
          Select on yes or no button which should open up your ICX wallet selection window followed by
          submitting the transaction. </p>` +
                `<div>In future we envision to add more functionality such as 
        <ul>
          <li>Create your own polling questions and submit to the blockchain</li>
          <li>Restrict polling per address ( if desired )</li>
          <li>Pay the transaction fee for the user to make it easy for participant to vote</li
          </div>
          </div>`,
            focusConfirm: false,


        })
    }
    pollingController.init();


})(pollingController);
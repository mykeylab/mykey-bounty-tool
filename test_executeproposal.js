let eosjs = require('eosjs');
const ecc = require('eosjs-ecc');

const httpEndpoint = 'https://api-kylin.eosasia.one';
const keyProvider = '';

let eos = eosjs({
    keyProvider: keyProvider,
    httpEndpoint: httpEndpoint,
    chainId: "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",  // kylin
    sign: true
});

let contract_mgr = '';
let contract_logic = '';
let client = '';
let proposer = '';

let sign_action = 'executeprop';
let act_approved = 'chgoprkey';
let index = ; // which operation key to change

(async() => {

    let binArg1 = await eos.abiJsonToBin(contract_logic, sign_action, [client, proposer, act_approved, index]);
    let bin1 = binArg1["binargs"];
    console.log("bin1:", bin1);

    eos.transaction({
        actions: [
            {
                account: contract_mgr,
                name: "sendaction",
                authorization: [
                    {
                        actor: "",
                        permission: "active"
                    }
                ],
                data: {
                    act: "executeprop",
                    bin_data: bin1
                }
            }
        ]
    })
        .then(result => {
            console.log("==========send action ok, result:", result);
        });

})();


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
let account_to = '';

let sign_action = 'freeze';
let sign_key_index = 0; // sign with admin key

(async() => {

    let binArg1 = await eos.abiJsonToBin(contract_logic, sign_action, [account_to]);
    let bin1 = binArg1["binargs"];
    console.log("bin1:", bin1);

    let res = await  eos.getTableRows({
        code:contract_mgr,
        scope:account_to,
        table:'keydata',
        json: true
    });
    let row = res.rows[sign_key_index];
    let key = row['key'];
    let nonce = key['nonce'];
    console.log(nonce);

    let msg = account_to + ":" + sign_action + ":" + bin1 + ":" + nonce;

    var digest = ecc.sha256(msg);
    // let pub = key['pubkey'];
    var privkey = '';
    var sigstr = ecc.signHash(digest, privkey).toString();
    console.log(sigstr);

    let binArg2 = await eos.abiJsonToBin(contract_logic, 'sendinternal', [sign_action, sigstr, bin1]);
    let bin2 = binArg2["binargs"];
    console.log("bin2:", bin2);

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
                    act: "sendinternal",
                    bin_data: bin2
                }
            }
        ]
    })
        .then(result => {
            console.log("==========send action ok, result:", result);
        });

})();


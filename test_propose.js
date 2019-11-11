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
let backup = '';

let sign_action = 'propose';
let prop_act = 'chgoprkey';
let index = ; // which operation key to change
let sign_key_index_client = 0; // client sign with admin key
let sign_key_index_backup = 4; // backup sign with assist key
let new_keys = [''];

(async() => {

    let binArg1 = await eos.abiJsonToBin(contract_logic, sign_action, [client, backup, prop_act, index, new_keys]);
    let bin1 = binArg1["binargs"];
    console.log("bin1:", bin1);

    //================client sign

    let res = await  eos.getTableRows({
        code:contract_mgr,
        scope:client,
        table:'keydata',
        json: true
    });
    let row = res.rows[sign_key_index_client];
    let key = row['key'];
    let nonce = key['nonce'];
    console.log(nonce);
    let msg = client + ":" + sign_action + ":" + bin1 + ":" + nonce;

    var digest = ecc.sha256(msg);
    // let pub = key['pubkey'];
    var privkey = '';

    var sigstr_client = ecc.signHash(digest, privkey).toString();
    console.log(sigstr_client);

    //================backup sign

    let res2 = await  eos.getTableRows({
        code:contract_mgr,
        scope:backup,
        table:'keydata',
        json: true
    });
    let row2 = res2.rows[sign_key_index_backup];
    let key2 = row2['key'];
    let nonce2 = key2['nonce'];
    console.log(nonce2);
    let b_action = "assist";
    let msg2 = backup + ":" + b_action + ":" + bin1 + ":" + nonce2;

    var digest2 = ecc.sha256(msg2);
    // let pub2 = key2['pubkey'];
    var privkey2 = '';

    var sigstr_backup = ecc.signHash(digest2, privkey2).toString();
    console.log(sigstr_backup);

    let binArg2 = await eos.abiJsonToBin(contract_logic, 'senddualsigs', [sign_action, sigstr_client, sigstr_backup, bin1]);
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
                    act: "senddualsigs",
                    bin_data: bin2
                }
            }
        ]
    })
        .then(result => {
            console.log("==========send action ok, result:", result);
        });

})();


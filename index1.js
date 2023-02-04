const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
require("dotenv").config();

    async function connect(){

        // Create our connection to the Hedera network
        const myAccountId = process.env.MY_ACCOUNT_ID;
        const myPrivateKey = process.env.MY_PRIVATE_KEY;
       
        if(!myAccountId || !myPrivateKey) {
            throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
        }
        const client = Client.forTestnet();
        client.setOperator(myAccountId,myPrivateKey);
        return client
    }
    async function createAccount(){
        //Create new keys
        const newAccountPrivateKey = PrivateKey.generateED25519();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        //Create a new account with 1,000 tinybar starting balance
        const newAccount = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(Hbar.fromTinybars(1000))
            .execute(client);
        
        console.log("new Account" + newAccount)
        // Get the new account ID
        const getReceipt = await newAccount.getReceipt(client)
        const newAccountId = getReceipt.accountId;

        //return account ID
        return newAccountId;

    }

    async function getBalance(){
        //Verify the account balance
        const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

        return accountBalance.hbars.toTinybars();
    }


    //returns transaction Status
    async function createTransaction(accountId1, accountId2){
        //Create the transfer transaction
        const sendHbar = await new TransferTransaction()
        .addHbarTransfer(accountId1, Hbar.fromTinybars(-1000)) //Sending account
        .addHbarTransfer(accountId2, Hbar.fromTinybars(1000)) //Receiving account
        .execute(client);
                
        //Verify the transaction reached consensus
        const transactionReceipt = await sendHbar.getReceipt(client);
        //return status
        return transactionReceipt.status.toString();

    }
    
    async function getQueryCost(){
        
    //Request the cost of the query
    const queryCost = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .getCost(client);

    return queryCost;

    }
    const client = connect()
    console.log(client)
    const newAccount = createAccount(client);
    console.log("your account id is " + newAccount);
    module.exports = {connect, createAccount, getBalance, getQueryCost, createTransaction }
    

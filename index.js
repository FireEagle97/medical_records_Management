const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
require("dotenv").config();
async function main(){

    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if(!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Create our connection to the Hedera network
    const client = Client.forTestnet();
    client.setOperator(myAccountId,myPrivateKey);

    //Create new keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    //Create a new account with 1,000 tinybar starting balance
    const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    // Get the new account ID
    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;

    //Log the account ID
    console.log("The new account ID is: " +newAccountId);

    //Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

    //Create the transfer transaction
    const sendHbar = await new TransferTransaction()
        .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000)) //Sending account
        .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000)) //Receiving account
        .execute(client);

    //Verify the transaction reached consensus
    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

    //Request the cost of the query
    const queryCost = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .getCost(client);

    console.log("The cost of query is: " +queryCost);

    //Check the new account's balance
    const getNewBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log("The account balance after the transfer is: " +getNewBalance.hbars.toTinybars() +" tinybar.")



}
main().catch(err => console.error(err));
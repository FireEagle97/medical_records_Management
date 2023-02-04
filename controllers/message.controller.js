const {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config({ path: `../.env` });

const getMessages = async (req, res) => {
  res.status(200).json({ test: "test" });
};

const addMessage = async (req, res) => {
  res.status(200).json({ test: "test" });
};

async function main() {
  //Grab your Hedera testnet account ID and private key from your .env file
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

  console.log("success!", myAccountId, myPrivateKey);

  // If we weren't able to grab it, we should throw a new error
  if (!myAccountId || !myPrivateKey) {
    throw new Error(
      "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
    );
  }

  // Create our connection to the Hedera network
  // The Hedera JS SDK makes this really easy!
  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);
  //connect
  //create new topic return topic id
  //Create a new topic
  /*   let txResponse = await new TopicCreateTransaction().execute(client);

  //Grab the newly generated topic ID
  let receipt = await txResponse.getReceipt(client);
  let topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);
 */
  // Wait 5 seconds between consensus topic creation and subscription creation
  await new Promise((resolve) => setTimeout(resolve, 5000));

  let topicId = "0.0.3377786";

  new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, (message) => {
      let messageAsString = Buffer.from(message.contents, "utf8").toString();
      console.log(
        `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
      );
    });

  // Send one message

  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "Hello, World!",
  }).execute(client);

  //Get the receipt of the transaction
  const getReceipt = await sendResponse.getReceipt(client);

  //Get the status of the transaction
  const transactionStatus = getReceipt.status;
  console.log("The message transaction status " + transactionStatus);
}
main().catch((err) => console.error(err));

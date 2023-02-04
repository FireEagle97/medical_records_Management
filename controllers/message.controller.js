const {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config({ path: `../.env` });

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

const hederaClient = Client.forTestnet();
hederaClient.setOperator(myAccountId, myPrivateKey);

// return the client
async function createTopic() {
  try {
    const response = await new TopicCreateTransaction().execute(hederaClient);
    console.log("TopicCreateTransaction()", `submitted tx`);
    const receipt = await response.getReceipt(hederaClient);
    const newTopicId = receipt.topicId;
    // subscribe(newTopicId);
    console.log("TopicCreateTransaction()", `success! new topic ${newTopicId}`);
    return newTopicId;
  } catch (error) {
    console.log("ERROR: TopicCreateTransaction()", error);
    process.exit(1);
  }
}
async function subscribe(topicId) {
  //Create the query
  try {
    new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0)
      .subscribe(
        hederaClient,
        (error) => {
          console.log("Message subscriber raised an error", error);
        },
        (message) => {
          let messageAsString = Buffer.from(
            message.contents,
            "utf8"
          ).toString();
          console.log(
            `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
          );
        }
      );
    console.log("you win");
  } catch (error) {
    console.log("ERROR: MirrorConsensusTopicQuery()", error);
    process.exit(1);
  }

  console.log("I'm subscribed");
}
async function publish(topicId, message) {
  // Send one message
  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: message,
  }).execute(hederaClient);
  const getReceipt = await sendResponse.getReceipt(hederaClient);

  //Get the status of the transaction
  const transactionStatus = getReceipt.status;
  return transactionStatus;
}

// async function main() {
//   // Build Hedera testnet and mirror node client

//   //Create a new topic
//   let txResponse = await new TopicCreateTransaction().execute(client);

//   //Grab the newly generated topic ID
//   let receipt = await txResponse.getReceipt(client);
//   let topicId = receipt.topicId;
//   console.log(`Your topic ID is: ${topicId}`);

//   // Wait 5 seconds between consensus topic creation and subscription creation
//   await new Promise((resolve) => setTimeout(resolve, 5000));

//   //Create the query
//   new TopicMessageQuery()
//     .setTopicId(topicId)
//     .subscribe(client, null, (message) => {
//       let messageAsString = Buffer.from(message.contents, "utf8").toString();
//       console.log(
//         `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
//       );
//     });

//   // Send one message
//   let sendResponse = await new TopicMessageSubmitTransaction({
//     topicId: topicId,
//     message: "Hello, HCS!",
//   }).execute(client);
//   const getReceipt = await sendResponse.getReceipt(client);

//   //Get the status of the transaction
//   const transactionStatus = getReceipt.status;
//   console.log("The message transaction status: " + transactionStatus);
// }
// main().catch((err) => console.error(err));

// const newTopic = createTopic();
// newTopic.then(() => {
//   console.log(newTopic);
// });
// console.log("this is the topic id" + " " + newTopic);
subscribe("0.0.3381880");
publish("0.0.3381880", "hello World");

//publish(subscribe(createTopic()), "hello again");

//module.exports = { createTopic, subscribe, publish };

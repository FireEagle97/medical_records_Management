const {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  Key,
} = require("@hashgraph/sdk");
require("dotenv").config({ path: `../.env` });

const CryptoJS = require("crypto-js");

const cryptoKey = "qwert";

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

const hederaClient = Client.forTestnet();
hederaClient.setOperator(myAccountId, myPrivateKey);
// console.log("the client " + JSON.stringify(hederaClient))

// return the client
async function createTopic() {
  try {
    const response = await new TopicCreateTransaction().execute(hederaClient);
    console.log("TopicCreateTransaction()", `submitted tx`);
    const receipt = await response.getReceipt(hederaClient);
    const newTopicId = receipt.topicId;
    console.log("TopicCreateTransaction()", `success! new topic ${newTopicId}`);
    return newTopicId;
  } catch (error) {
    console.log("ERROR: TopicCreateTransaction()", error);
    process.exit(1);
  }
}
async function subscribe(topicId) {
  //Create the query
  const messagesArr = [];
  try {
    new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0)
      .subscribe(hederaClient, (message) => {
        // const mirrorMessage = new TextDecoder("utf-8").decode(message.contents);
        // const messageJson = JSON.parse(mirrorMessage);
        // console.log(messageJson)

        // const runningHash = UInt8ToString(message["runningHash"]);
        // const timestamp = secondsToDate(message["consensusTimestamp"]);

        // const messageToUI = {
        //     operatorAccount: myAccountId ,
        //     client: hederaClient,
        //     message: messageJson,
        //     sequence: message.sequenceNumber.toString(10), // sequence number is a big integer
        //     runningHash: runningHash,
        //     timestamp: timestamp
        // }
        // console.log("message ToUO"+messageToUI)
        let messageAsString = Buffer.from(message.contents, "utf8").toString();
        console.log(
          `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
        );
        // console.log("contents " +message.contents)
      });
    console.log("you win");
  } catch (error) {
    console.log("ERROR: MirrorConsensusTopicQuery()", error);
    process.exit(1);
  }

  return messagesArr;
}
//get specific message
async function publish(topicId, message) {
  // Send one message
  let encrypted = CryptoJS.AES.encrypt(JSON.stringify(message), cryptoKey);
  encrypted = encrypted.toString();
  console.log(encrypted);

  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: encrypted,
  }).execute(hederaClient);
  const getReceipt = await sendResponse.getReceipt(hederaClient);

  //Get the status of the transaction
  const transactionStatus = getReceipt.status;
  return transactionStatus;
}

//add messages
//get all messages

message = {
  senderName: "John Smith",
  receiverName: "Joe Blow",
  message: "You don't look so good.",
};

//subscribe("0.0.3381880");
publish("0.0.3381880", message);

//publish(subscribe(createTopic()), "hello again");

module.exports = { createTopic, subscribe, publish };

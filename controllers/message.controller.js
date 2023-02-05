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
const { text } = require("express");

const cryptoKey = "qwert";

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
    console.log("TopicCreateTransaction()", `success! new topic ${newTopicId}`);
    return newTopicId;
  } catch (error) {
    console.log("ERROR: TopicCreateTransaction()", error);
    process.exit(1);
  }
}

let returnedMessageFromHedera = "";

function returnMessages(message) {
  let messageAsString = Buffer.from(message.contents);
  const json = JSON.stringify(messageAsString);

  const ciphertext = JSON.parse(json, (key, value) => {
    return value && value.type === "Buffer" ? Buffer.from(value) : value;
  });

  let bytes = CryptoJS.AES.decrypt("" + ciphertext, cryptoKey);
  console.log("========> decrypt: ", bytes);
  data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  console.log("data from subscribe function", data);

  returnedMessageFromHedera = data;

  return data;
  // console.log(`${message.consensusTimestamp.toDate()} Received: ${messageAsString}`);
}

async function subscribe(topicId) {
  //Create the query
  try {
    new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0)
      .subscribe(hederaClient, returnMessages);
  } catch (error) {
    console.log("ERROR: MirrorConsensusTopicQuery()", error);
    //process.exit(1);
  }
}
//get specific message
async function publish(topicId, message) {
  // Send one message
  let ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(message),
    cryptoKey
  ).toString();

  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: ciphertext,
  }).execute(hederaClient);
  const getReceipt = await sendResponse.getReceipt(hederaClient);

  //Get the status of the transaction
  const transactionStatus = getReceipt.status;
  return transactionStatus;
}

//add messages
async function addNewMessage(req, res) {
  console.log("test");
  const { message } = req.body;
  console.log("body ----------> " + message);

  const topicId = await createTopic();
  console.log(topicId);
  console.log("topicid ---------->" + topicId);
  const status = await publish(topicId, message);
  console.log("status ---------->" + status);

  res.status(200).json(status);
}
//get all messages
// /api/messages?topicId=2424
// api/messages/14243
async function getMessages(req, res) {
  //const { id } = req.query.topicId
  console.log("========GET MESSAGES=========");
  const { id } = req.params;

  const data = await subscribe(id);

  console.log(
    "==== THIS IS THE DATA FROM GETMESSAGES() ====" + JSON.stringify(data)
  );

  res.status(200).json(returnedMessageFromHedera);
}

message = {
  senderName: "John Smith",
  receiverName: "Joe Blow",
  message: "You don't look so good.",
};
// const topicId = createTopic();
// console.log(topicId);

subscribe("0.0.3382070");
//publish("0.0.3382026", message);

module.exports = {
  createTopic,
  subscribe,
  publish,
  addNewMessage,
  getMessages,
};

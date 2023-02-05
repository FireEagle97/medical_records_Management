const express = require("express");
const {
  getMessages,
  addMessage,
  addNewMessage,
} = require("../controllers/message.controller.js");

const router = express.Router();

// Get all messages
router.get("/", getMessages);

// POST a message
router.post("/", addNewMessage);

module.exports = router;

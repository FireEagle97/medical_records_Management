const express = require("express");
const {
  getMessages,
  addMessage,
} = require("../controllers/message.controller.js");

const router = express.Router();

// Get all messages
router.get("/", getMessages);

// POST a message
router.post("/", addMessage);

module.exports = router;

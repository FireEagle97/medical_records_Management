const express = require("express");
const {
  getMessages,
  addNewMessage,
} = require("../controllers/message.controller.js");

const router = express.Router();

// Get all messages
router.get("/:id", getMessages);

// POST a message
router.post("/", addNewMessage);

module.exports = router;

const express = require("express");
const app = require("../controllers/message.controller.js");

const router = express.Router();

// Get all messages
router.get("/", );

// POST a message
router.post("/", addMessage);

module.exports = router;

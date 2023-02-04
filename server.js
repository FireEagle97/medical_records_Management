require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const messageRoutes = require("./routes/message.routes");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
  console.log(
    `➡️ Connected to MongoDb 🖥️. Server listening on port ${PORT} 🎧`
  );
});

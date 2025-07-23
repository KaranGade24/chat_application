const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Chat Application Backend");
});

const port = 8080;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

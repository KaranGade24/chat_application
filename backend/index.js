const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { connectDB } = require("./config/mongodbConnection");
const { authenticate } = require("./authentication/authentication");
const { Server } = require("socket.io");
const http = require("http");
const { socketfuntion } = require("./config/socket");

const app = express();
app.use(
  cors({
    origin: "https://super-duper-capybara-vx7qrv4wv47h94p-5173.app.github.dev", // your frontend
    credentials: true, // allow cookies to be sent
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
module.exports = { io };

socketfuntion(io);

//connections
connectDB();

//routes

app.get("/", (req, res) => {
  res.send("Welcome to the Chat Application");
});

// Authentication routes
const authRouter = require("./router/authentication");
app.use("/auth", authRouter);

// Fetch friends route
const fetchFriendsRouter = require("./router/friends");
app.use("/friends", authenticate, fetchFriendsRouter);

//message
const messageRouter = require("./router/message");
app.use("/messages", authenticate, messageRouter);

const port = 8080;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

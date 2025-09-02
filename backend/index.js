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
const { cloudinaryConnection } = require("./config/cloudinaryConnection");
const path = require("path");

const app = express();
app.use(
  cors({
    origin: "*", // your frontend
    credentials: true, // allow cookies to be sent
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,"public","dist")));

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
cloudinaryConnection();

//routes

// app.get("/", (req, res) => {
//   res.send("Welcome to the Chat Application");
// });

// Authentication routes
const authRouter = require("./router/authentication");
app.use("/auth", authRouter);

// Fetch friends route
const fetchFriendsRouter = require("./router/friends");
app.use("/friends", authenticate, fetchFriendsRouter);

//message
const messageRouter = require("./router/message");
app.use("/messages", authenticate, messageRouter);

//chat files
const chatFilesRouter = require("./router/chatFiles");
const User = require("./model/User");
app.use("/chatfiles", authenticate, chatFilesRouter);

//profile
const profileRouter = require("./router/User");
app.use("/profile", authenticate, profileRouter);

app.get(/.*/,(req,res)=>{
  res.sendFile(path.join(__dirname,"public","dist","index.html"));
})
console.log(path.join(__dirname,"public","dist","index.html"))


const port = 8080;

server.listen(port, async () => {
  // const user = await User.find();
  // console.log("All registered user list: ", { user });
  console.log(`Server is running on http://localhost:${port}`);
});

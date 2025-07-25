const express = require("express");
const { getMessagesBetweenUsers } = require("../controller/message");
const router = express.Router();

router.get("/", getMessagesBetweenUsers);

module.exports = router;

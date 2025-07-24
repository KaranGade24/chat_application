const express = require("express");
const { fetchFriends, addFriend } = require("../controller/friends");
const router = express.Router();

router.get("/:userId", fetchFriends);
router.post("/add", addFriend);

module.exports = router;

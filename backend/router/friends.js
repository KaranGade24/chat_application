const express = require("express");
const {
  fetchFriends,
  addFriend,
  deleteFriendForYou,
} = require("../controller/friends");
const router = express.Router();

router.get("/:userId", fetchFriends);
router.post("/add", addFriend);
router.delete("/delete-friend", deleteFriendForYou);

module.exports = router;

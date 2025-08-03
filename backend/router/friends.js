const express = require("express");
const {
  fetchFriends,
  addFriend,
  deleteFriendForYou,
  deleteFriendForBoth,
} = require("../controller/friends");
const router = express.Router();

router.get("/:userId", fetchFriends);
router.post("/add", addFriend);
router.delete("/delete-friend", deleteFriendForYou);
router.delete("/delete-both-user-from-side", deleteFriendForBoth);

module.exports = router;

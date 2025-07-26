const { socketfuntion } = require("../config/socket");
const { io } = require("../index");
const User = require("../model/User");

exports.addFriend = async (req, res) => {
  try {
    const { userId, friendEmail } = req.body;

    if (!userId || !friendEmail) {
      return res
        .status(400)
        .json({ error: "User ID and friend email are required." });
    }

    // 1. Find the current user
    const user = await User.findById(userId).populate("friends", "email");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 2. Check if user is trying to add themselves
    if (user.email === friendEmail) {
      return res
        .status(400)
        .json({ error: "You cannot add yourself as a friend." });
    }

    // 3. Find the friend by email
    const friend = await User.findOne({ email: friendEmail });

    if (!friend) {
      return res
        .status(404)
        .json({ error: "Friend with this email not found." });
    }

    // 4. Check if already friends
    const alreadyFriend = user.friends.some((f) => f._id.equals(friend._id));
    if (alreadyFriend) {
      return res.status(400).json({ error: "Friend already added." });
    }

    // 5. Add each other
    user.friends.push(friend._id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

    console.log("Friend added successfully:", friend);

    res.status(200).json({
      message: "Friend added successfully.",
      friend,
    });
  } catch (err) {
    console.error("Add Friend Error:", err);
    res.status(500).json({ error: "Server error." });
  }
};

exports.fetchFriends = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "friends",
      "name email avatar isOnline"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("Fetched friends for user:", userId, user.friends);

    res.status(200).json({
      success: true,
      friends: user.friends,
    });
  } catch (err) {
    console.error("Error fetching friends:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/user/delete-friend
exports.deleteFriendForYou = async (req, res) => {
  try {
    const { currentUserId, targetUserId } = req.body;

    console.log("user to delete:", { currentUserId, targetUserId });

    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ error: "Both user IDs are required." });
    }

    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { friends: targetUserId } },
      { new: true }
    ).populate("friends", "name email profilePic isOnline");

    // Get updated user with populated friends
    const updatedUser = await User.findById(currentUserId).populate(
      "friends",
      "name email profilePic isOnline"
    );

    return res.status(200).json({
      message: "Friend deleted from your list.",
      updatedUser,
    });
  } catch (error) {
    console.error("Delete Friend (You) Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

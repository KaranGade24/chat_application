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

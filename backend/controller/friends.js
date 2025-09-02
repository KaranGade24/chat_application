const { socketfuntion, userSocketMap } = require("../config/socket");
const { io } = require("../index");
const Message = require("../model/Messages");
const User = require("../model/User");
exports.addFriend = async (req, res) => {
  try {
    const { userId, friendEmail } = req.body;
    console.log("come to add freinds");

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
    // userSocketMap
    const userSocketId = userSocketMap.get(userId.toString());
    const friendSocketId = userSocketMap.get(friend._id.toString());
    console.log({ fre: friend._id.toString(), userSocketMap, friendSocketId });

    console.log(
      `add friends1 :${userId} => ${userSocketId}\n,
      add fiend2 ${friend._id} => ${friendSocketId}\n`,
      userSocketMap
    );
    if (userSocketId || friendSocketId) {
      console.log(`add friends: ${userSocketId} 
         ${friendSocketId}`);
      io.to(userSocketId).emit("add-friend", {
        friend,
      });

      io.to(friendSocketId).emit("add-friend", {
        friend: user,
      });

      // console.log("new friend added:", { friend }, { user });
    }

    // return res.status(200).json({
    //   message: "Friend added successfully.",
    //   friend,
    // });

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
      "_id name email avatar isOnline lastSeen"
    );

    // const messages = await Promise.all(
    //   user.friends.map(async(friend) => {
    //             const allMessages = await Message.find({
    //               $or: [
    //                 { sender: user._id, receiver: friend._id },
    //                 { sender: friend._id, receiver: user._id },
    //               ],
    //             });
    //             return allMessages;
    //         })

    //     );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("Fetched friends for user:", {
      friends: user.friends,
    });

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
      { $pull: { friends: targetUserId } }, // this removes a specific friend
      { new: true }
    );
    // Get updated user with populated friends
    const updatedUser = await User.findById(currentUserId).populate(
      "friends",
      "name email avatar isOnline"
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

// DELETE delete-friend-both
exports.deleteFriendForBoth = async (req, res) => {
  try {
    console.log("user to delete:", req.body);
    const { currentUserId, targetUserId } = req.body;

    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ error: "Both user IDs are required." });
    }

    // Remove targetUserId from currentUser's friend list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: targetUserId },
    });

    // Remove currentUserId from targetUser's friend list
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { friends: currentUserId },
    });

    // Optionally: return updated current user info
    const updatedUser = await User.findById(currentUserId).populate(
      "friends",
      "name email avatar isOnline lastSeen"
    );

    console.log(`deleted from both side currentuserID: ${currentUserId}=> ${userSocketMap.get(
      currentUserId
    )}
    targetUserId: ${targetUserId} => ${userSocketMap.get(targetUserId)}`);

    io.to(userSocketMap.get(currentUserId)).emit("delete-friend", {
      currentUserId: currentUserId,
    });
    io.to(userSocketMap.get(targetUserId)).emit("delete-friend", {
      currentUserId: targetUserId,
    });

    console.log("updatedUser:", updatedUser);
    return res.status(200).json({
      message: "Friend deleted from both users.",
      friends: updatedUser.friends,
    });
  } catch (error) {
    console.error("Delete Friend (Both) Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

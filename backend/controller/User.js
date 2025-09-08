const { uploadFileToCloudinary } = require("../handler/clodinary");
const User = require("../model/User");

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const { name, email, bio, avatar } = req.body;
    let avatarData = {};
    console.log({ file: req.file });
    if (req.file) {
      avatarData = await uploadFileToCloudinary(req.file);
    }
    console.log({ avatarData });
    const updatedData = {
      name,
      email,
      bio: bio || "",
      avatar: avatarData,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: updatedData,
      },
      {
        new: true,
      }
    );

    console.log({ updatedUser });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

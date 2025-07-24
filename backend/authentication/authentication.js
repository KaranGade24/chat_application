const jwt = require("jsonwebtoken");
const User = require("../model/User");

exports.authenticate = async (req, res, next) => {
  let token = req.cookies.token;
  console.log(
    `Token from cookies: ${token}\nCookies: ${JSON.stringify(
      req.cookies,
      null,
      2
    )}`
  );
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

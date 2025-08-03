const express = require("express");
const upload = require("../config/multerConnection");
const { updateUser } = require("../controller/User");
const router = express.Router();

router.post("/:userId", upload.single("file"), updateUser);

module.exports = router;

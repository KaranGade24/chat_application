const express = require("express");
const { uploadFile } = require("../controller/chatFiles");
const upload = require("../config/multerConnection"); // multer config
const router = express.Router();

router.post("/", upload.array("files"), uploadFile);

module.exports = router;

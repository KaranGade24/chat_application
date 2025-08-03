const streamifier = require("streamifier");
const { cloudinary } = require("../config/cloudinaryConnection");

exports.uploadFileToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "chat_files",
        resource_type: "auto",
        public_id: `${Date.now()}_${file.originalname}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          filename: file.originalname,
          type: file.mimetype,
          size: file.size,
          cloudinary_id: result.public_id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

const cloudinary = require("cloudinary").v2;

const cloudinaryConnection = () => {
  cloudinary.config({
    cloud_name: process.env.CLODINARY_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET,
  });
  cloudinary.api.ping((error, result) => {
    if (error) return console.log(error);

    console.log(result);
  });
};

module.exports = { cloudinary, cloudinaryConnection };

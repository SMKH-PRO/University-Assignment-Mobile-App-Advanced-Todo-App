const express = require("express");
const router = express.Router();

const path = require("path");

var cloudinary = require("cloudinary").v2;
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname));
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

router.post("/upload-image", (req, res, next) => {
  try {
    const upload = multer({ storage }).single("image");

    upload(req, res, function (err) {
      if (err) {
        return res.send(err);
      }
      console.log("file uploaded to server");
      // console.log(req.file);
      let directory = req.body.directory;
      // SEND FILE TO CLOUDINARY
      cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
      });

      const path = req?.file?.path;
      const uniqueFilename = new Date().toISOString();
      console.log(req.file, "laskd;s");

      cloudinary.uploader.upload(
        path,
        { public_id: `${directory}/${uniqueFilename}`, tags: `img` }, // directory and tags are optional
        function (err, image) {
          if (err) return res.send(err);
          console.log("file uploaded to Cloudinary");
          // remove file from server
          const fs = require("fs");
          fs.unlinkSync(path);
          // return image details
          res.json(image);
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

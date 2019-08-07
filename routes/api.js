require('dotenv').config();

// Modules
const express = require('express');
const router = express.Router();
const services = require("../services/api");
const multer  = require('multer')
const path = require("path")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${path.resolve(path.join('./my-uploads'))}`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname)
  }
})
 
const upload = multer({ storage })

// Route to upload image
router.get("/", services.getIndexFile);
router.post("/image_upload", upload.single('avatar'), services.upload_image);

module.exports = router;
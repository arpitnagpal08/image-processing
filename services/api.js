// Global Object From Response
let response = {
  status: 0,
  message: "",
  data: {},
  apiReference: ""
}

const Jimp = require("jimp");
const async = require("async");
const path = require('path');
const fs = require("fs");

exports.upload_image          = upload_image;
exports.getIndexFile          = getIndexFile;

function upload_image(req, res, callback) {
  const filename1 = `R-${req.file.originalname}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
  const filename2 = `L-${req.file.originalname}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
  const filepath =  path.resolve(path.join('./my-uploads'))

  let image_process = new Promise((resolve, reject) => {
    async.waterfall([
      readImage,
      cropImagePart1,
      cropImagePart2,
    ], (error, resp) => {
      if(error) {
        // if error then throw error
        reject(error);
      } else {
        // removes original file
        fs.unlink(req.file.path, (err) => {
          if(err)
            console.log(err)
        })
        // if no error then display success
        resolve(resp);
      }
    })
  })
  .then(data => {
    response.status = 1;
    response.message = "Image cropped successfully.";
    response.data = {
      file1: filename1,
      file2: filename2
    }
    response.apiReference = "/image_upload"
    res.redirect(`/`)
  })
  .catch(error => {
    console.log(error)
    response.apiReference = "/image_upload";
    response.message = 'Image crop failed.';
    res.json(response);
  })

  function readImage(cb) {
    // read file
    Jimp.read(req.file.path)
      .then(lemma => {
        cb(null, {width: lemma.bitmap.width, height: lemma.bitmap.height, lemma: lemma, file: req.file.path});
      })
  }

  function cropImagePart1(data, cb) {
    // get first part of image
    data.lemma.crop(0, 1, data.width, data.height/2, (err) => {
      if(err)
        console.log(err)
    })
    .resize(260, 260)
    .write(`${filepath}/${filename1}`)
    cb(null, data);
  }

  function cropImagePart2(data, cb) {
    // get second part of image
    Jimp.read(data.file)
    .then(lemma => {
      lemma.flip(false, true, (err) => {
        if(err)
          console.log(err)
      })
      .crop(0, 1, data.width, data.height/2, (err) => {
        if(err)
          console.log(err)
      })
      .flip(false, true, err => {
        if(err)
          console.log(err)
      })
      .resize(260, 260)
      .write(`${filepath}/${filename2}`)
    })
    cb(null, data)
  }

}

function getIndexFile(req, res, callback) {
  res.sendFile(`${path.resolve(path.join('./index.html'))}`)
}
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
        for(let file of req.files) {
          fs.unlink(file.path, (err) => {
            if(err)
              console.log(err)
          })
        }
        // if no error then display success
        resolve(resp);
      }
    })
  })
  .then(data => {
    response.status = 1;
    response.message = "Image cropped successfully.";
    response.data = {}
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
    let arr = [];
    for(let file of req.files) {
      Jimp.read(file.path)
        .then(lemma => {
          arr.push({width: lemma.bitmap.width, height: lemma.bitmap.height, lemma: lemma, file: file})
          if(arr.length == req.files.length)
            cb(null, arr);
        })
    }
  }

  function cropImagePart1(images, cb) {
    // get first part of image
    images.forEach(data => {
      data.lemma.crop(0, 0, data.width/2, data.height, (err) => {
        if(err)
          console.log(err)
      })
      .resize(260, 260)
      .write(`${filepath}/L-${data.file.originalname}-${Date.now()}.${data.file.mimetype.split('/')[1]}`)
    });
    cb(null, images);

  }

  function cropImagePart2(images, cb) {
    let count = 0;
    images.forEach(data => {
      // get second part of image
      Jimp.read(data.file.path)
      .then(lemma => {
        lemma.flip(true, false, (err) => {
          if(err)
            console.log(err)
        })
        .crop(0, 0, data.width/2, data.height, (err) => {
          if(err)
            console.log(err)
        })
        .flip(true, false, err => {
          if(err)
            console.log(err)
        })
        .resize(260, 260)
        .write(`${filepath}/R-${data.file.originalname}-${Date.now()}.${data.file.mimetype.split('/')[1]}`)
        count += 1;
        if(count == images.length) 
          cb(null, images)
      })
    })
  }

}

function getIndexFile(req, res, callback) {
  res.sendFile(`${path.resolve(path.join('./index.html'))}`)
}
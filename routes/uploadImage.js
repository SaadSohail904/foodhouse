const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require("../middleware/functions.js");
const multer  = require('multer');
const fs = require('fs');
const path = require('path');
/* GET users listing. */
const relativePath = path.resolve(__dirname, '../public/userImages');

var imageFiles = {
  "image":""
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      dir =`${relativePath}`;
      fs.mkdir(dir, err=>{
        if (err && err.code != 'EEXIST') throw err;
      })
      cb(null, `${dir}`)
    },
    filename: (req, file, cb) => {
      imageFiles[file.fieldname]=file.fieldname+ Date.now()+ '.jpg';

      cb(null, imageFiles[file.fieldname])
    }
});

const upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) {
        console.log(file)
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    }
});

router.post('/', upload.fields([{name: 'image'}]), async function (req, res) {
      try{
        if(imageFiles['image'].length > 0){

          let pathToSend = "/userImages";
          imageFiles['image'] = `${pathToSend}/${imageFiles['image']}`;
          console.log(req.body)
            imageFiles['image'] = imageFiles['image'].replace(/\\/g,"/");
            let query = `Update user set image = "${imageFiles['image']}" where id = ${req.body.user_id}`;
            console.log(query)
            let queryResults = await functions.runQuery(query);
            res.send({statusCode: 200, message: "Image updated", data: imageFiles['image']});
         
        } else{
          res.send({statusCode: 405, message: "No image uploaded"});
        }
    } catch (error){
        res.send({statusCode: 405, message: error.message});
    }
})


function deleteFile(imagePath){
    fs.unlink(imagePath, (err) => {
    if (err) throw err;
  });
}
module.exports = router;

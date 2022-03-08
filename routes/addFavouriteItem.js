const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    food_item_id: Joi.number().integer().required(), 
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
        var insertionResults = await functions.runQuery(`Insert into favourites_user_food_mapper(user_id, food_item_id) values(${req.body.user_id}, ${req.body.food_item_id})`);
        res.send({ statusCode: 200, message: "Added succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    if(error.code=="ER_DUP_ENTRY"){
        res.send({"statusCode": 405, "message": "You have already added that item to favourites"});
  
      } else{
        res.send({"statusCode": 405, "message": error.message});
      }
  }
})

module.exports = router;

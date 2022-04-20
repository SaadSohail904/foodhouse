const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    cart_id: Joi.number().integer().required(), 
    food_item_id: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
        var insertionResults = await functions.runQuery(`Delete from cart_food_items_mapper where cart_id = ${req.body.cart_id} && food_item_id = ${req.body.food_item_id}`);
        console.log(insertionResults)
        res.send({ statusCode: 200, message: "Removed succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

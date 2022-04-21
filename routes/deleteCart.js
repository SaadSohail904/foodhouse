const express = require('express');
const Joi = require('joi');
const router = express.Router();
const cart = require("../models/cart.js");
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
          var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.body.user_id}`)
          var insertionResults = []
          if(customerResults.length){
            req.body.cart_id = await cart.exists(customerResults[0].id)
            if(req.body.cart_id){
              var insertionResults = await functions.runQuery(`Delete from cart_food_items_mapper where cart_id = ${req.body.cart_id}`);
            }
          }
        console.log(insertionResults)
        res.send({ statusCode: 200, message: "Deleted succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

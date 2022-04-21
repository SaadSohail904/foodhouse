const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    food_item_id: Joi.number().integer().required(),
    amount: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
      var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.body.user_id}`)
      var insertionResults = []
      if(customerResults.length){
          req.body.cart_id = await cartExists(customerResults[0].id)
          if(!req.body.cart_id){
            insertionResults = await functions.runQuery(`Insert into cart(customer_id, restaurant_id) values(${customerResults[0].id}, ${req.body.restaurant_id})`);
            req.body.cart_id = insertionResults.insertId;
          }
      }
      console.log(`Insert into cart_food_items_mapper(cart_id, food_item_id, amount) values(${req.body.cart_id}, ${req.body.food_item_id}, ${req.body.amount}) ON DUPLICATE KEY UPDATE amount=values(amount)`)
      await functions.runQuery(`Insert into cart_food_items_mapper(cart_id, food_item_id, amount) values(${req.body.cart_id}, ${req.body.food_item_id}, ${req.body.amount}) ON DUPLICATE KEY UPDATE amount=values(amount)`);
      res.send({ statusCode: 200, message: "Added to cart succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    if(error.code=="ER_DUP_ENTRY"){
        res.send({"statusCode": 405, "message": "You have already added this item to cart"});
      } else{
        res.send({"statusCode": 405, "message": error.message});
      }
  }
})
async function cartExists(customer_id){
  let cartResults = await functions.runQuery(`Select id from cart where customer_id = ${customer_id}`)
  console.log(cartResults)
  if(cartResults.length){
    return cartResults[0].id
  } else{
    return false;
  }
}

module.exports = router;

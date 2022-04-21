const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required()
});
router.get('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.query);
    if(!validated.error){
      var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.query.user_id}`)
      var cartItems = []
      if(customerResults.length){
        cartItems = await functions.runQuery(`Select * from food_items f right join cart_food_items_mapper c on f.id = c.food_item_id right join cart on cart.id = c.cart_id
        where cart.customer_id = ${customerResults[0].id}`);
      }
    
         res.send({ statusCode: 200, message: "Data retrieved", data: cartItems} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

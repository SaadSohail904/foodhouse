const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    cart_id: Joi.number().integer().required(), 
    user_id: Joi.number().integer().required()
});
router.get('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.query);
    if(!validated.error){
        var cartItems = await functions.runQuery(`Select * from food_items f right join cart_food_items_mapper c on f.id = c.food_item_id 
        where cart_id = ${req.query.cart_id}`);
        res.send({ statusCode: 200, message: "Data retrieved", data: cartItems} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

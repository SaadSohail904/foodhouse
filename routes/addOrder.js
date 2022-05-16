const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    restaurant_id: Joi.number().integer().required(), 
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
      var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.body.user_id}`)
      if(customerResults.length){
        var foodItemResults = await functions.runQuery(`Select distinct(f.id) from food_items f inner join cart_food_items_mapper c where c.id in (Select id from cart where customer_id = ${customerResults[0].id})`);
        console.log(foodItemResults)

        var insertionResults = await functions.runQuery(`Insert into orders(customer_id, restaurant_id, status, created_at) values(${customerResults[0].id}, ${req.body.restaurant_id}, "Pending", CURRENT_TIMESTAMP)`);
        let itemsQuery = `Insert into order_food_items_mapper(order_id, food_item_id) values`
        for(let item of foodItemResults){
          itemsQuery+=`(${insertionResults.insertId} ${item.id}),`
        }
        if(foodItemResults.length){
          itemsQuery = itemsQuery.slice(0, -1)
          console.log(itemsQuery)
        }
        // await functions.runQuery(`Delete from cart_food_items_mapper where cart_id in (Select id from cart where customer_id = ${customerResults[0].id})`);
      }
      res.send({ statusCode: 200, message: "Added succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
      res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

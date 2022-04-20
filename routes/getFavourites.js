const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    restaurant_id: Joi.number().integer(), 
    user_id: Joi.number().integer().required()
});
router.get('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.query);
    if(!validated.error){
        if(!req.query.restaurant_id){
            req.query.restaurant_id = -1;
        }
        var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.query.user_id}`)
        var favouritesResult = []
        if(customerResults.length){
          console.log(`Select f.* from food_items f left join favourites_customer_food_mapper 
          where (restaurant_id = ${req.query.restaurant_id} || ${req.query.restaurant_id} = -1) && customer_id = ${customerResults[0].id}`)
          favouritesResult = await functions.runQuery(`Select f.* from food_items f left join favourites_customer_food_mapper m on f.id = m.food_item_id 
          where (f.restaurant_id = ${req.query.restaurant_id} || ${req.query.restaurant_id} = -1) && m.customer_id = ${customerResults[0].id}`);
        
        }
        res.send({ statusCode: 200, message: "Data retrieved", data: favouritesResult} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

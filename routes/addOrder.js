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
        var insertionResults = await functions.runQuery(`Insert into orders(customer_id, restaurant_id, status, created_at) values(${customerResults[0].id}, ${req.body.restaurant_id}, "Pending", CURRENT_TIMESTAMP)`);
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

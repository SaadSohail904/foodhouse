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
        var insertionResults = await functions.runQuery(`Insert into cart(user_id, restaurant_id) values(${req.body.user_id}, ${req.body.restaurant_id})`);
        console.log(insertionResults)
        res.send({ statusCode: 200, message: "Added succesfully", data:{cart_id: insertionResults.insertId}} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

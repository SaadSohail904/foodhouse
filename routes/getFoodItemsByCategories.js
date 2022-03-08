const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    categories: Joi.array(),
    restaurant_id: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!req.body.categories || !req.body.categories.length){
      req.body.categories = [-1];
    }
    if(!validated.error){
        var foodItemsResults = await functions.runQuery(`Select * from food_items where restaurant_id = ${req.body.restaurant_id} && category_id in (${req.body.categories.toString()})`);
        res.send({ statusCode: 200, message: "Data retrieved", data: foodItemsResults} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');


const validationSchema = Joi.object().keys({
    filter: Joi.string(),
    user_id: Joi.number().integer().required()
});
router.get('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.query);
    if(!req.query.filter){
      req.query.filter = "";
    }
    if(!validated.error){
      var restaurantResults = await functions.runQuery(`Select *, restaurants.id as id from restaurants inner join user on restaurants.user_id = user.id  where name like "%${req.query.filter}%"`);
      var categoryResults = await functions.runQuery(`Select * from categories where name like "%${req.query.filter}%"`);
        res.send({ statusCode: 200, message: "Data retrieved", data: {categories: categoryResults, restaurants: restaurantResults} });
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

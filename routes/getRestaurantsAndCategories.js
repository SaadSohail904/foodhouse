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
      var restaurantResults = await functions.runQuery(`Select *, restaurants.id as restaurant_id from restaurants inner join user on restaurants.user_id = user.id  where name like "%${req.query.filter}%"`);
      var categoryResults = await functions.runQuery(`Select * from categories where name like "%${req.query.filter}%"`);
      if(checkIfAdmin){
        var restaurantRatings = await functions.runQuery(`Select SUM(rating) as ratingSum, COUNT(orders.id) as ordersCount, restaurant_id from orders inner join restaurants on restaurants.id = orders.restaurant_id group by orders.restaurant_id `)
        for(let originalRestaurant in restaurantResults){
          for(let ratingRestaurant in restaurantRatings){
            if(ratingRestaurant.restaurant_id === originalRestaurant.restaurant_id){
              originalRestaurant.rating = Math.round(parseFloat(ratingRestaurant.ratingSum)/parseFloat(ratingRestaurant.ordersCount))
            }
          }
        }
      }
      res.send({ statusCode: 200, message: "Data retrieved", data: {categories: categoryResults, restaurants: restaurantResults} });
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

async function checkIfAdmin(id){
  let adminsResults = await functions.runQuery(`Select * from admin`)
  if(adminsResults.length){
    for(let admin of adminsResults){
      if(id == admin.user_id){
        return true
      }
    }
  }
  return false
}
module.exports = router;

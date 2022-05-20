const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    restaurant_id: Joi.string().required(),
    user_id: Joi.number().integer().required()
});
router.get('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.query);
    if(!validated.error){
      console.log(req.query)
        var foodItemsResults = await functions.runQuery(`Select * from food_items where restaurant_id = ${req.query.restaurant_id}`);
        var bestSellerResults = await functions.runQuery(`Select *, COUNT(m.food_item_id) as count from food_items f inner join order_food_items_mapper m on m.food_item_id = f.id where f.restaurant_id = 22 GROUP by food_item_id order by count DESC LIMIT 1`);
        if(bestSellerResults.length && foodItemsResults.length){
          for(let item of foodItemsResults){
            if(item.id === bestSellerResults[0].food_item_id){
              item.bestSeller = true;
            } else{
              item.bestSeller = false;
            }
          }
        }
        var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.query.user_id}`)
        if(customerResults.length){
          var favourites = await functions.runQuery(`Select * from favourites_customer_food_mapper m inner join food_items f on m.food_item_id = f.id 
          where m.customer_id = ${customerResults[0].id} && f.restaurant_id = ${req.query.restaurant_id}`)
          for(let item of foodItemsResults){
            let itemFound = false;
            for(let favouriteItem of favourites){
              if(favouriteItem.food_item_id == item.id){
                itemFound = true;
                break;
              }
            }
            item.is_favourite = itemFound;
          }
        }
       
        res.send({ statusCode: 200, message: "Data retrieved", data: foodItemsResults} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

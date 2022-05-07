const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');
const _ = require('lodash')

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required()
});
router.get('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.query);
    if(!validated.error){
        var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.query.user_id}`)
        var ordersResults = []
        if(customerResults.length){
          ordersResults = await functions.runQuery(`Select o.id as order_id, o.status, o.customer_id as customer_id,
          o.restaurant_id as restaurant_id, f.name, f.id as food_item_id, f.price, f.image, f.category_id from orders o inner join order_food_items_mapper m on o.id = m.order_id inner join food_items f
          on m.food_item_id = f.id where (o.customer_id = ${customerResults[0].id}`);
        }
        let ordersArray = _.uniqBy(ordersResults, "order_id");
        for(let order of ordersArray){
            order = _.pick(order, [
                "order_id",
                "status",
                "customer_id",
                "restaurant_id"
            ])
            order['food_items'] = [];
            for(let food_item of ordersResults){
                if(order.order_id == food_item.order_id){
                    order['food_items'].push(_.pick(food_item, [
                        "name",
                        "food_item_id",
                        "price",
                        "image",
                        "category_id"
                    ]))
                }
            }
        }
        res.send({ statusCode: 200, message: "Data retrieved", data: ordersArray} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

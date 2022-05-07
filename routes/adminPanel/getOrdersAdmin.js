const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../../middleware/functions');
const _ = require('lodash')

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required(),
    admin_id: Joi.number().integer().required()
});
router.get('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.query);
    if(!validated.error){
        var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.query.user_id}`)
        var ordersResults = []
        if(customerResults.length){
            console.log(`Select o.id as order_id, o.status, o.customer_id as customer_id,
            o.restaurant_id as restaurant_id, r.name as restaurant_name, f.name, f.id as food_item_id, f.price, f.image, f.category_id from orders o inner join order_food_items_mapper m on o.id = m.order_id inner join food_items f
            on m.food_item_id = f.id inner join restaurants r on r.id = f.restaurant_id where (o.customer_id = ${customerResults[0].id}`)
          ordersResults = await functions.runQuery(`Select o.id as order_id, o.status, o.customer_id as customer_id,
          o.restaurant_id as restaurant_id, f.name, f.id as food_item_id, f.price, f.image, f.category_id from orders o inner join order_food_items_mapper m on o.id = m.order_id inner join food_items f
          on m.food_item_id = f.id where o.customer_id = ${customerResults[0].id}`);
        }
        let ordersArray = _.uniqBy(ordersResults, "order_id");
        console.log(JSON.stringify(ordersArray))
        console.log(JSON.stringify(ordersResults))
        for(let i = 0; i < ordersArray.length; i++){
            ordersArray[i] = _.pick(ordersArray[i], [
                "order_id",
                "status",
                "customer_id",
                "restaurant_id",
                "restaurant_name"
            ])
            ordersArray[i]['food_items'] = [];
        for(let food_item of ordersResults){
                if(ordersArray[i].order_id == food_item.order_id){
                    ordersArray[i]['food_items'].push(_.pick(food_item, [
                        "name",
                        "food_item_id",
                        "price",
                        "image",
                        "category_id"
                    ]))
                }
            }
        console.log(ordersArray[i])
        console.log(ordersArray)
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

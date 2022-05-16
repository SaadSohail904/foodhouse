const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');
const pool = require("../db.js");
const { cartExists } = require("../models/cart.js");

const validationSchema = Joi.object().keys({
    food_item_id: Joi.number().integer().required(),
    restaurant_id: Joi.number().integer().required(),
    amount: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try {
    pool.getConnection(function(err, con) {
      if(err){
        console.log(err);
        return res.send({ statusCode: 405, message: "Error connecting to database" });
      }
      con.beginTransaction(async function () {
        try{
          let validated = validationSchema.validate(req.body);
          if(!validated.error){
            var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.body.user_id}`)
            var insertionResults = []
            if(customerResults.length){
                req.body.cart_id = await cartExists(customerResults[0].id)
                if(!req.body.cart_id){
                  insertionResults = await functions.runQuery(`Insert into cart(customer_id, restaurant_id) values(${customerResults[0].id}, ${req.body.restaurant_id})`);
                  req.body.cart_id = insertionResults.insertId;
                }
            }
            console.log(`Select * from cart_food_items_mapper c inner join food_items on food_items.id = c.food_item_id where c.cart_id = ${req.body.cart_id}`)
            let previousItems = await functions.runQuery(`Select * from cart_food_items_mapper c inner join food_items on food_items.id = c.food_item_id where c.cart_id = ${req.body.cart_id}`);
            if(previousItems.length && previousItems[0].restaurant_id != req.body.restaurant_id){
            con.rollback();
             return res.send({ statusCode: 405, message: "You have already added items from another restaurant. Kindly clear cart before proceeding."} );
            }
            console.log(`Insert into cart_food_items_mapper(cart_id, food_item_id, amount) values(${req.body.cart_id}, ${req.body.food_item_id}, ${req.body.amount}) ON DUPLICATE KEY UPDATE amount=values(amount)`)
            await functions.runQuery(`Insert into cart_food_items_mapper(cart_id, food_item_id, amount) values(${req.body.cart_id}, ${req.body.food_item_id}, ${req.body.amount}) ON DUPLICATE KEY UPDATE amount=values(amount)`);
            con.commit();
            res.send({ statusCode: 200, message: "Added to cart succesfully"} );
          }else {
            con.rollback();
            res.send({ statusCode: 405, message: validated.error.message });
          }
        } catch(err) {
              con.rollback();
              res.send({"statusCode": 405, "message": err.message});
        }
      })
    })
  } catch (err) {
    res.send({ statusCode: 405, message: err.message })
  }
})

module.exports = router;

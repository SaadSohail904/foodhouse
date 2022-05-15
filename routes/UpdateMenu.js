const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    menu: Joi.array().required(), 
    restaurant_id: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
        var restaurantResults = await functions.runQuery(`Select * from food_items where restaurant_id=${req.body.restaurant_id}`);
        console.log(insertionResults)
        let restaurantsToAdd = req.body.menu.filter(newItem=>{
            !restaurantResults.some(oldItem =>{
                newItem.id == oldItem.id
            })
        })
        let restaurantsToRemove = req.body.menu.filter(oldItem=>{
            !restaurantResults.some(newItem =>{
                newItem.id == oldItem.id
            })
        })
        console.log("restaurantsToAdd", restaurantsToAdd)
        console.log("restaurantsToRemove", restaurantsToRemove)
        res.send({ statusCode: 200, message: "Updated cart succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;
[{"category_id": 2, "id": 6, "image": "/publicImages/orange_juice.jpg", "name": "Orange Juice", "price": 200, "restaurant_id": 1}, {"category_id": 3, "id": 14, "image": "/publicImages/fries.jpg", "name": "Fries", "price": 200, "restaurant_id": 1}, {"category_id": 3, "id": 15, "image": "/publicImages/nuggets.jpg", "name": "Nuggets", "price": 250, "restaurant_id": 1}, {"category_id": 4, "id": 18, "image": "/publicImages/vanilla_cone.jpg", "name": "Vanilla Cone", "price": 180, "restaurant_id": 1}, {"category_id": 4, "id": 19, "image": "/publicImages/mcflurry_oreo.jpg", "name": "Mcflurry Oreo", "price": 400, "restaurant_id": 1}]
const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
  user_id: Joi.number().integer().required(),
  role: Joi.number().integer()
});
router.get('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.query);
    if(!validated.error){
      let userResults = []
          console.log(userResults)
          userResults = await functions.runQuery(`Select *, customer.id as customer_id from customer inner join user on user.id=customer.user_id where customer.user_id = ${req.query.user_id}`);
      if(userResults.length && !req.query.role){
        req.query.role = 0;
      } else if(!req.query.role && !userResults.length){
        req.query.role = 1;
      }
      switch(parseInt(req.query.role)){
        case 0: 
          userResults = await functions.runQuery(`Select *, customer.id as customer_id from customer inner join user on user.id=customer.user_id where user.id = ${req.query.user_id}`);
          
          if(userResults.length){
            let cartResults = await functions.runQuery(`Select * from cart where cart.customer_id = ${userResults[0].customer_id}`);
            if(cartResults.length){
              userResults[0].cart_id = cartResults[0].id;
            }
          }
            userResults[0].role = 0
            console.log(userResults)
          break;
        case 1:
          userResults = await functions.runQuery(`Select *, restaurants.id as restaurants_id from restaurants inner join user on user.id=restaurants.user_id where user.id = ${req.query.user_id}`);
          if(userResults.length){
            userResults[0].fname = userResults[0].owner
            userResults[0].lname = ""
            userResults[0].role = 1
          }
          break;
        case 2:
          userResults = await functions.runQuery(`Select *, admin.id as admin_id from admin inner join user on user.id=admin.user_id where user.id = ${req.query.user_id}`);
            userResults[0].role = 2
            break;
        default:
          break;
      }
        res.send({ statusCode: 200, message: "Data retrieved", data: userResults} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

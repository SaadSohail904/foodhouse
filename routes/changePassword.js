const express = require('express');
const router = express.Router();
const Joi = require('joi');
const functions = require('../middleware/functions');



const validationSchema = Joi.object().keys({
    password: Joi.string().required(),
    role: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    var validated = validationSchema.validate(req.body, { abortEarly: false });
    if(!validated.error){
      switch(parseInt(req.body.role)){
        case 0: 
          var customerResults = await functions.runQuery(`Select customer.id from customer where customer.user_id = ${req.body.user_id}`)
          if(customerResults.length){
            var queryResults = await functions.runQuery(`Update customer set password = "${req.body.password}" where id = ${customerResults[0].id}`);
          }
          break;
        case 1:
          var restaurantResults = await functions.runQuery(`Select restaurant.id from restaurant where restaurant.user_id = ${req.body.user_id}`)
          if(restaurantResults.length){
            var queryResults = await functions.runQuery(`Update restaurant set password = "${req.body.password}" where id = ${restaurantResults[0].id}`);
          }
          break;
        case 2:
          var adminResults = await functions.runQuery(`Select admin.id from admin where admin.user_id = ${req.body.user_id}`)
          if(adminResults.length){
            var queryResults = await functions.runQuery(`Update admin set password = "${req.body.password}" where id = ${adminResults[0].id}`);
          }
          break;
        default:
          break;
      }
        res.send({ statusCode: 200, message: "Password updated" });
    }
    else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }

})

module.exports = router;

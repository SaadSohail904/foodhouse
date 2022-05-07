const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    owner: Joi.string().required(),
    address: Joi.string().required(),
    mobileno: Joi.number().integer().required(),
    password: Joi.string().required(),
    admin_id: Joi.number().integer()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
        var updateResults = await functions.runQuery(`Update restaurants set name = '${req.body.name}', email = '${req.body.email}', 
        mobileno = ${req.body.mobileno}, password = '${req.body.password}', address = '${req.body.address}', owner = '${req.body.owner}' where user_id = ${req.body.user_id}`);
        console.log(updateResults)
        res.send({ statusCode: 200, message: "Updated restaurant succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

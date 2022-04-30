const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required(),
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    email: Joi.string().email().required(),
    mobileno: Joi.number().integer().required(),
    password: Joi.string().required(),
    admin_id: Joi.number().integer()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
        var updateResults = await functions.runQuery(`Update customer set fname = '${req.body.fname}', lname = '${req.body.lname}', email = '${req.body.email}', 
        mobileno = ${req.body.mobileno}, password = '${req.body.password}' where user_id = ${req.body.user_id}`);
        console.log(updateResults)
        res.send({ statusCode: 200, message: "Updated user succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

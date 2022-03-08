const express = require('express');
const router = express.Router();
const Joi = require('joi');
const functions = require('../middleware/functions');



const validationSchema = Joi.object().keys({
    password: Joi.string().required(),
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    var validated = validationSchema.validate(req.body, { abortEarly: false });
    if(!validated.error){
        var queryResults = await functions.runQuery(`Update user  set  password = "${req.body.password}" where id = ${req.body.user_id}`);
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

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../../middleware/functions');

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required(),
    admin_id: Joi.number().integer()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
        var updateResults = await functions.runQuery(`Update restaurants set verified = true where user_id = ${req.body.user_id}`);
        res.send({ statusCode: 200, message: "Approved successfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required(),
    status: Joi.boolean().required(),
    order_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
        if(req.body.status === true){
            await functions.runQuery(`Update orders set status = "Accepted" where id = ${req.body.order_id}`);
        } else {
            await functions.runQuery(`Update orders set status = "Rejected" where id = ${req.body.order_id}`);
        }
        res.send({ statusCode: 200, message: "Updated order succesfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

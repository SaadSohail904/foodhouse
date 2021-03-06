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
        var insertionResults = await functions.runQuery(`Delete from user where id = ${req.body.user_id}`);
        console.log(insertionResults)
        res.send({ statusCode: 200, message: "Deleted successfully"} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
    res.send({"statusCode": 405, "message": error.message});
  }
})

module.exports = router;

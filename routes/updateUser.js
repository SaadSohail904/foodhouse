const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    user_id: Joi.number().integer().required(),
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    mobileno: Joi.string().required(),
    password: Joi.string().required(),
    admin_id: Joi.number().integer()
});
router.post('/', async function (req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
        var updateResults = await functions.runParametersQuery(`Update customer set fname = ?,
        lname = ?,  mobileno = ? where user_id = ?`, [req.body.fname, req.body.lname, req.body.mobileno, req.body.user_id]);
        updateResults = await functions.runParametersQuery(`Update user set password = ? where id = ?`, [req.body.password, req.body.user_id]);
        updateResults = await functions.runQuery(`Update user set password = '${req.body.password}' where id = ${req.body.user_id}`);
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

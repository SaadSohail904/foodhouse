const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {smtpTransport,email} = require('../middleware/nodemailer');
const path = require('path');
const functions = require('../middleware/functions');

const validationSchema = Joi.object().keys({
    role: Joi.number().integer().required(),
    email: Joi.string().required()
})
router.post('/', async function(req, res, next) {
  try{
    let validated = validationSchema.validate(req.body);
    if(!validated.error){
      let user = [];
      switch(parseInt(req.body.role)){
        case 0: 
          user = await functions.runQuery(`Select  id, password from customer where email="${req.body.email}"`);
          break;
        case 1:
          user = await functions.runQuery(`Select  id, password from restaurant where email="${req.body.email}"`);
          break;
        case 2:
          user = await functions.runQuery(`Select  id, password from admin where email="${req.body.email}"`);
          break;
        default:
          break;
      }
      console.log(user)
      if(!user.length) {
        throw({statusCode: 405,
          "message" : "Email not registered"
        });
      }
      var mailOptions = {
        to: req.body.email,
        from: `Food House <${email}>`,
        subject: 'Food app Password Reset',
        html:`<p style="text-align: center;margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;">
        <br>
        You are receiving this because you (or someone else) has requested the reset of the password for your account.
        Your password is: <br>
        <span style="text-align:center; font-size: 19px;"> <b>${user[0].password}</b></span> <br><br>
        If you did not request this, please ignore this email.
        <br><br>
        Stay safe and have a good week!&nbsp;<br>
        <br>`
      };
      await smtpTransport.sendMail(mailOptions);
      
      res.send({statusCode:200, message: `Email sent successfully`});
    } else {
      res.send({statusCode: 405, message: validated.error.message});
    }
  } catch (error){
    console.log(error)
    res.send({statusCode: 405, message: error.message});
  }
});
module.exports = router;

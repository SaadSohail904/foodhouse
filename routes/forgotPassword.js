const express = require('express');
const router = express.Router();
const Joi = require('joi');
const crypto = require('crypto');
const {smtpTransport,emailAddress} = require('../middleware/nodemailer');
const path = require('path');
const functions = require('../middleware/functions');

router.post('/', async function(req, res, next) {
  try{
    let validated = await validateInput(req.body);
    if(!validated.error){
      let token = parseInt(Math.random()*10000).toString();
      console.log(`Select  id  from user  where email="${req.body.email}" && emailverified = 1`);
      let user = await functions.runQuery(`Select  id  from user  where email="${req.body.email}" && emailverified = 1`);
      console.log(user);
      if(!user.length) {throw({statusCode: 405,
        "message" : "Email not registered"
      });}
      token = parseInt(token + user[0].id);
      var query = (`Insert into passwordreset (user_id , code , start_date , end_date) values(${user[0].id}, ${token}, CURRENT_TIMESTAMP,
        DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR)) on duplicate key update code = values(code), start_date = values(start_date),
        end_date = values(end_date)`);
        let queryResults = await functions.runQuery(query);
        var mailOptions = {
          to: req.body.email,
          from: `Food House <${emailAddress}>`,
          subject: 'Food app Password Reset',
          html:`<p style="text-align: center;margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;">
          <br>
          You are receiving this because you (or someone else) has requested the reset of the password for your account.
          Please paste this into your app to complete the process: <br>
          <span style="text-align:center; font-size: 19px;"> <b>${token}</b></span> <br><br>
          If you did not request this, please ignore this email and your password will remain unchanged
          <br><br>
          Stay safe and have a good week!&nbsp;<br>
          <br>`
        };
        await smtpTransport.sendMail(mailOptions);
        res.send({statusCode:200, message: `An e-mail has been sent to ${req.body.email} with further instructions.`});
      } else {
        res.send({statusCode: 405, message: validated.error.message});
      }
    } catch (error){
      res.send({statusCode: 405, message: error.message});
    }
  });
  async function validateInput(input){
    const schema = Joi.object().keys({
      email: Joi.string().required()
    })
    const result = await schema.validate(input);
    return result;
  }

  module.exports = router;

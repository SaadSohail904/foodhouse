const mysql = require("mysql");
const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');
const pool = require("../db.js");



router.post('/', function (req, res) {
  pool.getConnection(function(err, con) {
    if(err){
      console.log(err);
      return res.send({ statusCode: 405, message: "Error connecting to database" });
    }
    con.beginTransaction(async function () {
      try {
  			let validationSchema = Joi.object().keys({
  			  name: Joi.string().required(),
  			  address: Joi.string().required(),
  			  email: Joi.string().email().required(),
  			  mobileno: Joi.number().integer().required(),
  			  password: Joi.string().required(),
  			  owner: Joi.string().required()
  			  // age: Joi.number().integer().required(),
  			});
  			let validation = validationSchema.validate(req.body, { abortEarly: false });
        if (!validation.error) {
  				// var age = req.body.age;
          req.body.email = req.body.email.toLowerCase();
          let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
          var userResults = await functions.runTransactionQuery(`Insert into user(email, password) values("${req.body.email}", "${req.body.password}")`, con);
          var queryResults = await functions.runTransactionQuery(`Insert into restaurants(name, owner, mobileno, address, user_id) values("${req.body.name}",
           "${req.body.owner}", "${req.body.mobileno}", "${req.body.address}",  ${userResults.insertId})`, con);
          console.log(`Registered restaurant ${queryResults.insertId} at ${new Date()}`)
        	con.commit();
          var mailOptions = {
            to: req.body.email,
            from: `Food House <${email}>`,
            subject: 'Food app Registration',
            html:`<p style="text-align: center;margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;">
            Hello ${req.body.owner}!
            <br>
            Thank you for registering to foodhouse. To proceed with your registration process kindly deposit a one-time payment of PKR 10000/- to the following account: 
            Account No. 12345678
            Account Title: Foodhouse Admin
            Bank: Habib Bank Limited
            Your registration request will be put on hold until the payment is completed. We look forward to working with you.
            <br><br>
            Stay safe and have a good day!&nbsp;<br>
            <br>`
          };
          await smtpTransport.sendMail(mailOptions);
            res.send({statusCode: 200, message:"Signed up successfully"});
  			} else {
          con.rollback();
          res.send({ statusCode: 405, message: validation.error.message });
        }
      } catch (err) {
        con.rollback();
  			console.log("Error in signup:", err);
        if (err.code == 'ER_DUP_ENTRY') {
          res.send({ statusCode: 405, message: 'Email already registered' });
        } else {
          res.send({ statusCode: 405, message: err.message });
        }
      }
    })
  })
})

module.exports = router;

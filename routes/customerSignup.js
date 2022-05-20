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
  			  fname: Joi.string().required(),
  			  lname: Joi.string().required(),
  			  email: Joi.string().email().required(),
  			  mobileno: Joi.number().integer().required(),
  			  address: Joi.string().required(),
  			  password: Joi.string().required(),
  			  gender: Joi.number().integer().required().valid(0, 1),
          role: Joi.number().integer().required()
  			  // age: Joi.number().integer().required(),
  			});
  			let validation = validationSchema.validate(req.body, { abortEarly: false });
        if (!validation.error) {
  				// var age = req.body.age;
          req.body.email = req.body.email.toLowerCase();
          let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
          var userResults = await functions.runTransactionQuery(`Insert into user(email, password) values("${req.body.email}", "${req.body.password}")`, con);
          var queryResults = await functions.runTransactionQuery(`Insert into customer(fname, lname, address, gender, mobileno, user_id) values("${req.body.fname}", "${req.body.lname}",
          "${req.body.address}", ${req.body.gender}, ${req.body.mobileno}, ${userResults.insertId})`, con);
          console.log(`Registered user ${queryResults.insertId} at ${new Date()}`)
        	con.commit();
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

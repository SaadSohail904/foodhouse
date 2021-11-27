const mysql = require("mysql");
var bcrypt = require('bcryptjs');
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
  			let schema = Joi.object().keys({
  			  fname: Joi.string().required(),
  			  lname: Joi.string().required(),
  			  mobileNo: Joi.string().required(),
  			  email: Joi.string().email().required(),
  			  password: Joi.string().required(),
  			  gender: Joi.number().integer().required().valid(0, 1),
  			  dob: Joi.date().required(),
  			});
  			let validation = await schema.validate(req.body, { abortEarly: false });
        if (!validation.error) {
          const hashedPassword = bcrypt.hashSync(req.body.password, 8);
  				var age = req.body.dob;
          let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
          var queryResults = await functions.runTransactionQuery(`Insert into user(fname, lname, emailverified, mobileno, password, age, gender, email) values("${req.body.fname}", "${req.body.lname}", 1, "${req.body.mobileNo}",
          "${hashedPassword}", ${age}, ${req.body.gender}, "${req.body.email}")`, con);
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
          res.send({ statusCode: 405, message: 'Email/mobile No. already registered' });
        } else {
          res.send({ statusCode: 405, message: err.message });
        }
      }
    })
  })
})

module.exports = router;

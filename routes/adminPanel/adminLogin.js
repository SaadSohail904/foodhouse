var bcrypt = require('bcryptjs');
const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');
const router = express.Router();
const functions = require('../middleware/functions');
const pool = require("../db.js");
const roles = require('../middleware/roles');


const validationSchema = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string().required()
});
router.post('/', async function (req, res, next) {
  let validated = validationSchema.validate(req.body, { abortEarly: false });
  try {
    pool.getConnection(function(err, con) {
      if(err){
        console.log(err);
        return res.send({ statusCode: 405, message: "Error connecting to database" });
      }
      con.beginTransaction(async function () {
        try {
          if (!validated.error) {
            req.body.email = req.body.email.toLowerCase();
            let user = await functions.runTransactionQuery(`SELECT id, fname as first_name, lname as last_name, email, password, dob, age, gender, created_at, updated_at, role FROM user  WHERE email = "${req.body.email}" && role = 'admin'`, con)
            if (user.length) {
              let token = crypto.randomBytes(32).toString('hex');
              let expiry_time = 1000*60*60*24*7;
              console.log(user[0].role)
              console.log(roles[user[0].role])
              user[0].role = roles[user[0].role]
              console.log(user[0].role)
              user[0].username = user[0].first_name + " " + user[0].last_name;
              if (req.body.password != user[0].password){
                res.send({ statusCode: 405, message: "Invalid credentials" })
              } else {
                if(user[0].is_email_verified){
                  let query = `Insert into authtoken (token , customer_id, start_date, end_date) values("${token}" ,${user[0].id},
                  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP,  INTERVAL 7 DAY))`;
                  await functions.runTransactionQuery(query, con);
                  con.commit();
                  console.log(`Logged in user ${user[0].id} at ${new Date}`);
                  res.send({ statusCode: 200, user: user[0], message: "Logged in successfully", token: token, expiry_time: expiry_time});
                } else{
                  con.rollback();
                  res.send({ statusCode: 405, message: "Email not verified" });
                }
              }
            } else {
              con.rollback();
              res.send({ statusCode: 405, message: "Email not registered" });
            }
          } else {
            con.rollback();
            res.send({ statusCode: 405, message: validated.error.message })
          }
        } catch (err) {
          con.rollback();
          res.send({ statusCode: 405, message: err.message });
        }
      })
    });
  } catch (err) {
    con.rollback();
    res.send({ statusCode: 405, message: err.message })
  }
})

module.exports = router;

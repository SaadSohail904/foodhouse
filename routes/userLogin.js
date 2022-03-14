var bcrypt = require('bcryptjs');
const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');
const router = express.Router();
const functions = require('../middleware/functions');
const pool = require("../db.js");


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
            let user = await functions.runTransactionQuery(`SELECT * FROM user  WHERE email = "${req.body.email}" && emailverified = 1`, con)
            if (user.length) {
              if (req.body.password != user[0].password){
                res.send({ statusCode: 405, message: "Invalid credentials" })
              } else {
                if(user[0].emailverified){
                  let query = `Insert into authtoken (token , user_id, start_date, end_date) values("${token}" ,${user[0].id},
                  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP,  INTERVAL 7 DAY))`;
                  await functions.runTransactionQuery(query, con);
                  con.commit();
                  console.log(`Logged in user ${user[0].id} at ${new Date}`);
                  res.send({ statusCode: 200, data: user[0], message: "Logged in successfully"});
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

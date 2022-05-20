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
            let restaurant = await functions.runTransactionQuery(`SELECT restaurant.id as restaurant_id, * FROM restaurant inner join
            user on restaurant.user_id = user.id WHERE email = "${req.body.email}"`, con)
            console.log(restaurant)
            if (restaurant.length) {
              if(!restaurant.verified){
                res.send({ statusCode: 405, message: "Your registration is still pending admin approval" });

              }
              if(!restaurant.payment_completed){
                res.send({ statusCode: 405, message: "Your payment is still pending" });

              }
              let token = crypto.randomBytes(32).toString('hex');
              let expiry_time = 1000*60*60*24*7;
              restaurant[0].role = roles[1]
              if (req.body.password != restaurant[0].password){
                res.send({ statusCode: 405, message: "Invalid credentials" })
              } else {
                  let query = `Insert into authtoken (token , user_id, start_date, end_date) values("${token}" ,${restaurant[0].user_id},
                  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP,  INTERVAL 7 DAY))`;
                  await functions.runTransactionQuery(query, con);
                  con.commit();
                  console.log(`Logged in restaurant ${restaurant[0].restaurant_id} at ${new Date}`);
                  res.send({ statusCode: 200, restaurant: restaurant[0], message: "Logged in successfully", token: token, expiry_time: expiry_time});
                
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

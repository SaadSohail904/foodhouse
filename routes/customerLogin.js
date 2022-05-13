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
            req.body.email = req.body.email.toLowerCase();
            let customer = await functions.runTransactionQuery(`SELECT customer.id as customer_id, fname as first_name, lname as last_name, email, password, dob, age, gender, created_at, updated_at, user_id, user.image FROM customer inner join
            user on customer.user_id = user.id WHERE email = "${req.body.email}"`, con)
            if (customer.length) {
              let cartResults = await functions.runQuery(`Select * from cart where cart.customer_id = ${customer[0].customer_id}`);
              if(cartResults.length){
                customer[0].cart_id = cartResults[0].id;
              }
              let token = crypto.randomBytes(32).toString('hex');
              let expiry_time = 1000*60*60*24*7;
              customer[0].role = 0
              customer[0].fullname = customer[0].first_name + " " + customer[0].last_name;
              if (req.body.password != customer[0].password){
                res.send({ statusCode: 405, message: "Invalid credentials" })
              } else {
                  let query = `Insert into authtoken (token , user_id, start_date, end_date) values("${token}" ,${customer[0].user_id},
                  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP,  INTERVAL 7 DAY))`;
                  await functions.runTransactionQuery(query, con);
                  con.commit();
                  console.log(`Logged in customer ${customer[0].customer_id} at ${new Date}`);
                  res.send({ statusCode: 200, customer: customer[0], message: "Logged in successfully", token: token, expiry_time: expiry_time});
                
              }
            } else {
              console.log(`SELECT * FROM restaurants inner join
              user on restaurants.user_id = user.id WHERE email = "${req.body.email}"`)
              let restaurant = await functions.runTransactionQuery(`SELECT *, restaurants.id as restaurant_id FROM restaurants inner join
              user on restaurants.user_id = user.id WHERE email = "${req.body.email}"`, con)
              if (restaurant.length) {
                let token = crypto.randomBytes(32).toString('hex');
                let expiry_time = 1000*60*60*24*7;
                restaurant[0].role = 1
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

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');

router.get('/', async function (req, res, next) {
  try{
     const usersResults = await functions.runQuery(`Select *, customer.id as customer_id from customer inner join user on user.id=customer.user_id`);
    res.send({ statusCode: 200, message: "Data retrieved", data: usersResults} );
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const functions = require('../middleware/functions');


const validationSchema = Joi.object().keys({
    categories: Joi.array().required(),
    user_id: Joi.number().integer().required()
});
router.post('/', async function (req, res, next) {
  try{
    console.log(req.body)
    let validated = validationSchema.validate(req.body);
    if(!validated.error){

        var restaurantResults = await functions.runQuery(`Select distinct r.id as id, r.* from restaurants r left join restaurant_categories_mapper m on r.id = m.restaurant_id left join
        categories c on m.category_id = c.id where c.id in (${req.body.categories.toString()})`);
        console.log(`Select distinct r.id, r.name from restaurants r left join restaurant_categories_mapper m on r.id = m.restaurant_id left join
        categories c on m.category_id = c.id where c.id in (${req.body.categories.toString()})`)
        res.send({ statusCode: 200, message: "Data retrieved", data: restaurantResults} );
    }else {
        res.send({ statusCode: 405, message: validated.error.message });
    }
  } catch(error) {
        res.send({ statusCode: 405, message: error.message });
  }
})

module.exports = router;

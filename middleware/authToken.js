const functions = require('../middleware/functions');



exports.validateUser = async (req , res  , next)=>{
  
  try{
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
      console.log(req.body)
      token = req.headers.authorization.substring(7, req.headers.authorization.length);
      let query = `select u.id as user_id, a.id as token_id, a.end_date from user u inner join authtoken a on u.id = a.user_id where a.token = "${token}"`;
      let queryResults =  await functions.runQuery(query);
      if(queryResults.length){
        let tokenEndDate = new Date(queryResults[0].end_date);
        await tokenEndDate.setMinutes(tokenEndDate.getMinutes());
        let currentDate = new Date();
        await currentDate.setMinutes(currentDate.getMinutes());
        if(tokenEndDate > currentDate){
          if(Object.keys(req.body).length){
            req.body.user_id = queryResults[0].user_id;
          } else{
            req.query.user_id = queryResults[0].user_id;
          }
          next();
        } else {
          await functions.runQuery(`Delete from authtoken where id = ${queryResults[0].token_id}`);
          res.send({statusCode:405, message: "Token has expired. Please login again."});
        }
      } else{
        console.log("Invalid token. Please login.");
        res.send({statusCode:405, message: "Invalid token. Please login."})
      }
    } else{
      console.log("Invalid token. Please login.");
      res.send({statusCode:405, message: "Invalid token. Please login."})
    }
    
  }catch(err){
    res.send({"statusCode": 405, "message": err.message});
  }
}

const connection = require('../db.js');

//Used to wait for query results
exports.runQuery = async function (query){
  return new Promise((resolve, reject) => {
    connection.query(query, function(err,rows){
      if(!err) {
        return resolve(rows);
      } else{
        return reject(err);
      }
    });
  });
}

exports.runParametersQuery = async function (query, params){
  return new Promise((resolve, reject) => {
    connection.query(query, params, function(err,rows){
      if(!err) {
        return resolve(rows);
      } else{
        return reject(err);
      }
    });
  });
}

exports.runTransactionQuery = async function (query, con){
  return new Promise((resolve, reject) => {
    con.query(query, function(err,rows){
      if(!err) {
        return resolve(rows);
      } else{
        return reject(err);
      }
    });
  });
}

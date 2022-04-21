
export function exists(customer_id){
    let cartResults = await functions.runQuery(`Select id from cart where customer_id = ${customer_id}`)
    console.log(cartResults)
    if(cartResults.length){
      return cartResults[0].id
    } else{
      return false;
    }
  }
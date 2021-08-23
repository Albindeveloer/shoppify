var db = require("../config/connection");
var collection = require("../config/collections");
var objectID = require("mongodb").ObjectID;

module.exports={

    addProduct: (product, callback) => {
        product.totalQuantity = parseInt(product.totalQuantity);
        if(product.totalQuantity<=0){                                      //totalQuantity and availability for know outofstock or not.myworkann
          product.availability=true
        }else{
          product.availability=false
        }
        console.log(product);
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .insertOne(product)
          .then((data) => {
            console.log(data.insertedId);
           let id= data.insertedId.toString()
           console.log(id)

            callback(id);
          });
      },
      getAllProduct: () => {
        return new Promise((resolve, reject) => {
          let products = db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .find()
            .toArray();
          resolve(products);
        });
      },
    
 
}
var db = require("../config/connection");
var collection = require("../config/collections");
const {ObjectId} = require('mongodb');


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
    
      deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(prodId)}).then((response) => {
              resolve(response);
            });
        });
      },

      getProductDetails: (prodId) => {
        console.log(prodId)
        return new Promise((resolve, reject) => {
          console.log("proid is:",prodId)
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .findOne({ _id: ObjectId(prodId)})
            .then((product) => {
              
              resolve(product);
            });
        });
      },

      updateProduct: (prodId, proDetails) => {
        proDetails.totalQuantity = parseInt(proDetails.totalQuantity);
        if(proDetails.totalQuantity<=0){                                      //totalQuantity and availability for know outofstock or not.myworkann
          proDetails.availability=true
        }else{
          proDetails.availability=false
        }
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { _id: ObjectId(prodId) },
              {
                $set: {
                  name: proDetails.name,
                  category: proDetails.category,
                  price: proDetails.price,
                  description: proDetails.description,
                  totalQuantity:proDetails.totalQuantity,
                  availability:proDetails.availability
                },
              }
            )
            .then((response) => {
              resolve();
            });
        });
      },
 
}
var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const {ObjectId} = require('mongodb');

module.exports={

    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
          userData.password = await bcrypt.hash(userData.password, 10);
          db.get()
            .collection(collection.USER_COLLECTION)
            .insertOne(userData)
            .then((data) => {
                console.log(data.insertedId);
                let id= data.insertedId.toString()
                console.log(id)
     
              resolve(id);
            });
        });
      },
      getSignupDetails: (id) => {
          console.log("**************")
          console.log(id)
        return new Promise((resolve, reject) => {
          let data = db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id:ObjectId(id)});
            
            console.log(data)
          resolve(data);
        });
      },

      doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
          let loginStatus = false;
          let response = {};
    
          let user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ email: userData.email });
          if (user) {
            bcrypt.compare(userData.password, user.password).then((status) => {
              if (status) {
                console.log("login success");
                response.user = user;
                response.status = true;
                resolve(response);
              } else {
                console.log("login failed in crrt psw");
                resolve({ status: false });
              }
            });
          } else {
            console.log("login failed inncorrect email");
            resolve({ status: false });
          }
        });
      },

      addToCart: (prodId, userId) => {
        let proObj = {
          item: ObjectId(prodId),
          quantity: 1,
        };
        return new Promise(async (resolve, reject) => {
          let userCart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOne({ user: ObjectId(userId) });
          console.log(userCart);
          console.log(prodId);
          if (userCart) {
            let proExist = userCart.products.findIndex(
              (product) => product.item == prodId
            );
            console.log(proExist);
            if (proExist != -1) {
              db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                  { user: ObjectId(userId), "products.item": ObjectId(prodId) },
                  {
                    $inc: { "products.$.quantity": 1 },
                  }
                )
                .then(() => {
                  resolve();
                });
            } else {
              db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                  { user: ObjectId(userId) },
                  {
                    $push: { products: proObj },
                  }
                )
                .then((response) => {
                  resolve();
                });
            }
          } else {
            let cartObj = {
              user: ObjectId(userId),
              products: [proObj],
            };
            db.get()
              .collection(collection.CART_COLLECTION)
              .insertOne(cartObj)
              .then((response) => {
                resolve();
              });
          }
        });
      },

      getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
          let cartItems = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: { user: ObjectId(userId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              },
            ])
            .toArray();
          resolve(cartItems);
        });
      },

      GetCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
          let count = 0;
          let cart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOne({ user: ObjectId(userId) });
          if (cart) {
            count = cart.products.length;
          }
          resolve(count);
        });
      },

      changeProductQuantity: (details) => {
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);
        return new Promise((resolve, reject) => {
          if (details.count == -1 && details.quantity == 1) {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { _id: ObjectId(details.cart) },
                {
                  $pull: { products: { item: ObjectId(details.product) } },
                }
              )
              .then((response) => {
                resolve({ removeProduct: true });
              });
          } else {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                {
                  _id: ObjectId(details.cart),
                  "products.item": ObjectId(details.product),
                },
                {
                  $inc: { "products.$.quantity": details.count },
                }
              )
              .then((response) => {
                resolve({status:true});
              });
          }
        });
      },

      removeProduct: (details) => {
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { _id: ObjectId(details.cart) },
              {
                $pull: { products: { item: ObjectId(details.product) } },
              }
            )
            .then((response) => {
              resolve({ removeProduct: true });
            });
        });
      },

      getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
          let total = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: { user: ObjectId(userId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              },
              {
                $group:{
                  _id:null,
                  total:{$sum:{$multiply:["$quantity",{$convert:{input:'$product.price',to:'int'}}]}}
                }
              }
            ])
            .toArray();
            console.log(total[0].total)
          resolve(total[0].total);
        });
      },
    
}
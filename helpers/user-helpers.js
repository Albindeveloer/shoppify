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
    
}
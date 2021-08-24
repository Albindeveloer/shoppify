const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.session.user;
  console.log(user)
  productHelpers.getAllProduct().then((products)=>{
    
    res.render('user/view-products', { admin: false,products,user});
  })
  
});

router.get("/shop-grid",(req,res)=>{
  productHelpers.getAllProduct().then((products)=>{
    
    res.render('user/shop-grid',{products});
  })
})

router.get("/login",(req,res)=>{
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
})
router.get("/signup",(req,res)=>{
  res.render("user/signup")
})

router.post("/signup",(req, res) => {
 userHelpers.doSignup(req.body).then((id)=>{
   userHelpers.getSignupDetails(id).then((response)=>{
     console.log(response)

     req.session.user = response;
     req.session.userLoggedIn = true;
     
  res.redirect("/")
   })

 })   
 
});

router.post("/login",(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/")
    }else{
      req.session.userLoginErr = "invalid emailid or password";
      res.redirect("/login")
    }
  })
})

router.get("/logout", (req, res) => {
  
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect("/")
  
});

module.exports = router;

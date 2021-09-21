const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get('/', async function(req, res, next) {
  let user = req.session.user;
  console.log(user)
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.GetCartCount(req.session.user._id);
  }
  let catagory=await productHelpers.getAllCatagory();
  productHelpers.getAllProduct().then((products)=>{
    
    res.render('user/view-products', { admin: false,products,user,catagory,cartCount});
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


router.get("/catagory",verifyLogin,async(req,res)=>{
  let cata=req.query.catagory;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.GetCartCount(req.session.user._id);
  }
  let catagory=await productHelpers.getAllCatagory();
  productHelpers.getCatagoryProduct(cata).then((products)=>{
    
    res.render('user/catagory', { admin: false,products,catagory,cartCount});
  })
})

router.get("/cart", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.GetCartCount(req.session.user._id);
  }


  let products = await userHelpers.getCartProducts(req.session.user._id);
  console.log(products);
  let total=0
  if(products.length>0){
    total=await userHelpers.getTotalAmount(req.session.user._id);
  }
  
  res.render("user/cart", { products, user: req.session.user,total,cartCount });
});

router.get("/add-to-cart/:id",(req, res) => {
  console.log("api call");
  
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      // res.redirect("/");  ajax use cheynd add to cart clickil
      res.json({ status: true });
    });
 
});

router.post("/change-product-quantity", (req, res) => {
  userHelpers.changeProductQuantity(req.body).then(async(response) => {
    let products = await userHelpers.getCartProducts(req.session.user._id);
    let total=0
  if(products.length>0){
    response.total=await userHelpers.getTotalAmount(req.body.user);
  }
    res.json(response);
  });
});

router.post("/remove-product", (req, res) => {
  console.log("hai");
  userHelpers.removeProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/place-order",verifyLogin, async(req, res) => {
  let total=await userHelpers.getTotalAmount(req.session.user._id);
  res.render("user/place-order",{total,user:req.session.user});
});

router.post("/place-order",async(req,res)=>{
  console.log(req.body)
  let products=await userHelpers.getCartProductList(req.body.userId)
  let total=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,total).then((orderId)=>{
    if(req.body["payment-method"]==='COD'){
      res.json({codSuccess:true})
    // }else{
    //   userHelpers.generateRazorpay(orderId,total).then((response)=>{
    //     res.json(response)
    //   })
    }
  
  });
 
});

router.get("/order-success",async(req,res)=>{
  
  res.render("user/order-success",{user: req.session.user})
})

router.get("/orders",verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render("user/orders",{user:req.session.user,orders})
})

router.get("/view-order-products",async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.query.id)
    res.render("user/view-order-products",{user:req.session.user,products});
 
})

module.exports = router;

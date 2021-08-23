var express = require('express');
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");

/* GET home page. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProduct().then((products)=>{
    
    res.render('user/view-products', { admin: false,products});
  })
  
});

router.get("/shop-grid",(req,res)=>{
  productHelpers.getAllProduct().then((products)=>{
    
    res.render('user/shop-grid',{products});
  })
})

module.exports = router;

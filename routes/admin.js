var express = require('express');
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/view-products', { admin: true});
});

router.get("/add-product", (req, res) => {
  res.render("admin/add-product",{admin: true});
});
router.post("/add-product",(req, res) => {
  console.log(req.body);
  console.log(req.files.image);

  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;
    console.log(id);
    
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
         res.render("admin/add-product",{admin: true});
      } else {
        console.log(err);
      }
    });
  });
});



module.exports = router;

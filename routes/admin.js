var express = require('express');
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");


/* GET users listing. */
router.get('/',function(req, res, next) {


  productHelpers.getAllProduct().then((products)=>{
    res.render('admin/view-products', { admin: true,products});
  })
  
});

router.get("/add-product", async(req, res) => {
  let catagory=await productHelpers.getAllCatagory();
  console.log(catagory);
  res.render("admin/add-product",{catagory,admin: true});
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

router.get("/delete-product/:id", (req, res) => {
  let prodId = req.params.id;
  console.log(prodId);
  console.log("url now:",req.url)
  productHelpers.deleteProduct(prodId).then((response) => {
    res.redirect("/admin");
  });
});

router.get("/edit-product/",async(req, res) => {
  let prodId = req.query.id; 
  let catagory=await productHelpers.getAllCatagory();                                //matte params methodil pass cheythal err varunu .because of url three times chenge avunu
  console.log("url now:",req.url)
  let product = await productHelpers.getProductDetails(prodId); //.then vachum edukam.normal cheyunapole
  console.log(product);

  res.render("admin/edit-product",{product,admin:true,catagory});
});

router.post("/edit-product/:id", (req, res) => {
  let prodId = req.params.id;
  productHelpers.updateProduct(prodId, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.image) {
      let image = req.files.image;
      image.mv("./public/product-images/" + prodId + ".jpg");
    }
  });
});
module.exports = router;

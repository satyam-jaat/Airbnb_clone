const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../Schema.js");
const Listing = require("../models/listing.js");


const validateListing = (req, res, next) => {

    let {error} = listingSchema.validate(req.body);
    // console.log(result);
  
    if(error) {
      let errorMessage = error.details.map((el) => {return el.message}).join(",");
      throw new ExpressError(400, errorMessage);
    }else {
      next();
    }
  
  };
  

//Index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

//Create route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {

    const newlisitng = new Listing(req.body.listing);
    await newlisitng.save();
    res.redirect("/listings");

    // let {title ,description, image, price, country, location} = req.body
    // let listing = req.body.listing;
    // const newlisitng = new Listing(listing);
    // await newlisitng.save();
    // res.redirect("/listings");
})
);

router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {

    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing")
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete listings route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


module.exports = router;
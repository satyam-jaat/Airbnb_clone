const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../Schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    // console.log(result);

    if(error) {
      let errorMessage = error.details.map((el) => {return el.message}).join(",");
      throw new ExpressError(400, errorMessage);
    }else {
      next();
    }
  };


//Reviews
//POST reviews
router.post("/", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
  
    await newReview.save();
    await listing.save();
  
    res.redirect(`/listings/${listing._id}`);
  }));
  
  //Delete Review Route
  router.delete("/:reviewId", wrapAsync(async(req, res) => {
    
    let {id, reviewId} = req.params;
  
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
  
    res.redirect(`/listings/${id}`);
  }))
  
  module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./Schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

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

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });


//Index route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
}));

//New route
app.get("/listings/new", (req, res) =>{
  res.render("listings/new.ejs");
});

//Show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", {listing});
}));

//Create route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {

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

app.get("/listings/:id/edit", wrapAsync(async (req, res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
}));

//Update route
app.put("/listings/:id", validateListing, wrapAsync(async(req, res) => {

  if(!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing")
  }
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//Delete route
app.delete("/listings/:id", wrapAsync(async(req, res) => {
  let {id} = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

//Reviews
//POST reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

// Catch-all for unmatched routes
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let{statusCode=500, message="something went wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log("Server is listening at port 8080");
});
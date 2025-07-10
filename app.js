const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
});

//New route
app.get("/listings/new", (req, res) =>{
  res.render("listings/new.ejs");
});

//Show route
app.get("/listings/:id", async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", {listing});
});

//Create route
app.post("/listings", async (req, res) => {
  // let {title ,description, image, price, country, location} = req.body
  let listing = req.body.listing;
  const newlisitng = new Listing(listing);
  await newlisitng.save();
  res.redirect("/listings");
});

app.get("/listings/:id/edit", async (req, res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
});

//Update route
app.put("/listings/:id", async(req, res) => {
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
});

//Delete route
app.delete("/listings/:id", async(req, res) => {
  let {id} = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

app.listen(8080, () => {
    console.log("Server is listening at port 8080");
});
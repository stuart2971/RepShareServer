const express = require("express");
const router = express.Router();

const ListingModel = require("../models/Listing");
const {
    addListing,
    doesExist,
    getListing,
    getListingData,
} = require("./utils/ListingUtils");

router.post("/addListing", async (req, res) => {
    const newListing = await addListing(req.body);
    res.json(newListing);
});

router.post("/doesExist", async (req, res) => {
    const exists = await doesExist(req.body.link);
    res.json(exists);
});

router.get("/:listingId", async (req, res) => {
    const listing = await getListing(req.params.listingId);
    res.json(listing);
});

router.post("/getListingData", async (req, res) => {
    const listingData = await getListingData(req.body.listings);
    res.json(listingData);
});
module.exports = router;

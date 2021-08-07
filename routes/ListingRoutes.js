const express = require("express");
const router = express.Router();

const ListingModel = require("../models/Listing");
const {
    addListing,
    doesExist,
    getListing,
    getListingsData,
    getNewListings,
} = require("./utils/ListingUtils");

router.post("/addListing", async (req, res) => {
    const newListing = await addListing(req.body);
    res.json(newListing);
});

router.post("/doesExist", async (req, res) => {
    const exists = await doesExist(req.body.link);
    res.json(exists);
});

router.get("/getListing/:listingId", async (req, res) => {
    const listing = await getListing(req.params.listingId);
    res.json(listing);
});

router.post("/getListingsData", async (req, res) => {
    const listingData = await getListingsData(req.body.listings);
    res.json(listingData);
});

router.get("/newListings/:limit/:skip", async (req, res) => {
    const newListings = await getNewListings(
        parseInt(req.params.limit),
        parseInt(req.params.skip)
    );
    res.json(newListings);
});
module.exports = router;

const express = require("express");
const router = express.Router();

const UserModel = require("../models/User");

const {
    createHaul,
    removeHaul,
    getHaul,
    getHaulsData,
    addListingToHaul,
    removeListingFromHaul,
} = require("./utils/HaulUtils");

router.get("/:auth0Id/createHaul/:haulName", async (req, res) => {
    const newHauls = await createHaul(req.params.auth0Id, req.params.haulName);
    res.json(newHauls);
});

router.get("/:auth0Id/removeHaul/:haulId", async (req, res) => {
    const newHauls = await removeHaul(req.params.auth0Id, req.params.haulId);
    res.json(newHauls);
});

router.get("/:auth0Id/getHaul/:haulId", async (req, res) => {
    const haul = await getHaul(req.params.auth0Id, req.params.haulId);
    res.json(haul);
});

router.get("/:auth0Id/getHaulsData", async (req, res) => {
    const haulsData = await getHaulsData(req.params.auth0Id);
    res.json(haulsData);
});

router.get("/:auth0Id/getHaulsData", async (req, res) => {
    const haulsData = await getHaulsData(req.params.auth0Id);
    res.json(haulsData);
});

router.get("/:auth0Id/addToHaul/:haulId/:listingId", async (req, res) => {
    const message = await addListingToHaul(
        req.params.auth0Id,
        req.params.haulId,
        req.params.listingId
    );
    res.json(message);
});

router.get("/:auth0Id/removeFromHaul/:haulId/:listingId", async (req, res) => {
    const message = await removeListingFromHaul(
        req.params.auth0Id,
        req.params.haulId,
        req.params.listingId
    );
    res.json(message);
});

module.exports = router;

const express = require("express");
const router = express.Router();

const UserModel = require("../models/User");

const {
    createHaul,
    removeHaul,
    getHaul,
    getHaulsData,
} = require("./utils/HaulUtils");

router.get("/:auth0Id/createHaul/:haulName", async (req, res) => {
    const newUser = await createHaul(req.params.auth0Id, req.params.haulName);
    res.json(newUser);
});

router.get("/:auth0Id/removeHaul/:haulId", async (req, res) => {
    const newUser = await removeHaul(req.params.auth0Id, req.params.haulId);
    res.json(newUser);
});

router.get("/:auth0Id/getHaul/:haulId", async (req, res) => {
    const haul = await getHaul(req.params.auth0Id, req.params.haulId);
    res.json(haul);
});

router.get("/:auth0Id/getHaulsData", async (req, res) => {
    const haulsData = await getHaulsData(req.params.auth0Id);
    res.json(haulsData);
});

module.exports = router;

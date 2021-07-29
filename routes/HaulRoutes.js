const express = require("express");
const router = express.Router();

const UserModel = require("../models/User");

const { createHaul, removeHaul, getHaul } = require("./utils/HaulUtils");

router.get("/:auth0Id/createHaul/:haulName", async (req, res) => {
    const newUser = await createHaul(req.params.auth0Id, req.params.haulName);
    res.json({ user: newUser });
});

router.get("/:auth0Id/removeHaul/:haulId", async (req, res) => {
    const newUser = await removeHaul(req.params.auth0Id, req.params.haulId);
    res.json({ user: newUser });
});

router.get("/:auth0Id/getHaul/:haulId", async (req, res) => {
    const haul = await getHaul(req.params.auth0Id, req.params.haulId);
    res.json({ haul });
});

module.exports = router;

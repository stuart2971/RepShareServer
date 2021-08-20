const express = require("express");
const router = express.Router();

const {
    getUser,
    getDashboardData,
    getMyListings,
    increaseNumberOfQualityChecks,
} = require("./utils/UserUtils");

router.get("/:auth0Id/getUser/:name", async (req, res) => {
    const user = await getUser(req.params.auth0Id, req.params.name);
    res.json(user);
});

router.get("/:auth0Id/getDashboardData", async (req, res) => {
    const dashboardData = await getDashboardData(req.params.auth0Id);
    res.json(dashboardData[0]);
});

router.get("/:auth0Id/getMyListings", async (req, res) => {
    const myListings = await getMyListings(req.params.auth0Id);
    res.json(myListings);
});

router.get("/:auth0Id/test", async (req, res) => {
    const a = await increaseNumberOfQualityChecks(req.params.auth0Id);
    res.json(a);
});

module.exports = router;

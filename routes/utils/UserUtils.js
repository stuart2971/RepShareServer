const UserModel = require("../../models/User");
const ListingModel = require("../../models/Listing");

// If the user does not exist, returns the newly inserted user.  If it
// does exist, returns the user doc
async function getUser(auth0Id, name) {
    try {
        const user = await UserModel.findOne({ auth0Id }, "auth0Id currency");
        if (user) {
            return user;
        } else {
            const newUser = new UserModel({
                name,
                auth0Id,
                currency: "yuan",
                numberOfQualityChecks: 0,
                hauls: [],
                listingsContributed: [],
            });

            return new Promise((resolve) => {
                newUser.save((err, doc) => {
                    if (err) console.log(err);
                    resolve(doc);
                });
            });
        }
    } catch (err) {
        console.log("ERROR GETTING USER", err);
    }
}

// Gets the length of hauls and listings contributed as well as how many quality checks
async function getDashboardData(auth0Id) {
    try {
        const dashboardData = await UserModel.aggregate([
            { $match: { auth0Id } },
            {
                $project: {
                    numberOfListingsContributed: {
                        $size: "$listingsContributed",
                    },
                    numberOfHauls: { $size: "$hauls" },
                    numberOfQualityChecks: 1,
                },
            },
        ]);
        return dashboardData;
    } catch (err) {
        console.log("ERROR GETTING DASHBOARD DATA", err);
    }
}

// Fetches listings that user contributed to public
async function getMyListings(auth0Id) {
    try {
        const listingIds = await UserModel.findOne(
            { auth0Id },
            "listingsContributed"
        );
        const myListings = await ListingModel.find({
            _id: {
                $in: listingIds.listingsContributed,
            },
        });
        return myListings;
    } catch (err) {
        console.log("ERROR GETTING MY LISTINGS", err);
    }
}

module.exports = { getUser, getDashboardData, getMyListings };

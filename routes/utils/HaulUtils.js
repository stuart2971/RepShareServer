const UserModel = require("../../models/User");

const { isIdValid } = require("./GeneralUtils");

// Creates a haul and returns all the hauls in the updated document
async function createHaul(auth0Id, haulName) {
    try {
        const haul = {
            name: haulName,
            listings: [],
        };
        const newUser = await UserModel.findOneAndUpdate(
            { auth0Id },
            { $push: { hauls: haul } },
            {
                new: true,
                projection: {
                    "hauls.listings": 0,
                    listingsContributed: 0,
                    name: 0,
                    auth0Id: 0,
                    currency: 0,
                    numberOfQualityChecks: 0,
                },
            }
        );
        return newUser;
    } catch (err) {
        console.log("ERROR trying to create haul.  ", err);
    }
}

// Removes a haul and returns all the remaining hauls in the updated document.
// If haul is not found, returns null
async function removeHaul(auth0Id, haulId) {
    try {
        if (!ObjectId.isValid(haulId)) return null;
        const newUser = await UserModel.findOneAndUpdate(
            { auth0Id },
            { $pull: { hauls: { _id: haulId } } },
            {
                new: true,
                projection: {
                    "hauls.listings": 0,
                    listingsContributed: 0,
                    name: 0,
                    auth0Id: 0,
                    currency: 0,
                    numberOfQualityChecks: 0,
                },
            }
        );
        return newUser;
    } catch (err) {
        console.log("ERROR trying to create haul.  ", err);
    }
}

// Gets a single haul from the array of hauls
async function getHaul(auth0Id, haulId) {
    try {
        if (!isIdValid(haulId)) return null;

        const haul = await UserModel.findOne(
            {
                auth0Id,
                "hauls._id": haulId,
            },
            {
                "hauls.$": 1,
            }
        );
        return haul;
    } catch (err) {
        console.log("ERROR trying to create haul.  ", err);
    }
}

// Gets the haul name, id, and number of listings of all the hauls in a user
async function getHaulsData(auth0Id) {
    try {
        const haulsData = await UserModel.aggregate([
            { $match: { auth0Id } },
            { $unwind: "$hauls" },
            {
                $project: {
                    listingSize: {
                        $size: "$hauls.listings",
                    },
                    name: "$hauls.name",
                },
            },
        ]);
        return haulsData;
    } catch (err) {
        console.log("ERROR trying to create haul.  ", err);
    }
}
// Adds a listing to the users haul.  If successfully inserts, returns user id, otherwise null
async function addListingToHaul(auth0Id, haulId, listingId) {
    try {
        if (!isIdValid(haulId) || !isIdValid(listingId)) return null;

        const inserted = await UserModel.findOneAndUpdate(
            { auth0Id, "hauls._id": haulId },
            { $push: { "hauls.$.listings": listingId } },
            {
                projection: {
                    hauls: 0,
                    listingsContributed: 0,
                    name: 0,
                    auth0Id: 0,
                    currency: 0,
                    numberOfQualityChecks: 0,
                },
            }
        );
        return inserted;
    } catch (err) {
        console.log("ERROR trying to create haul.  ", err);
    }
}

// Removes a listing to the users haul.  If successfully removes, returns user id, otherwise null
async function removeListingFromHaul(auth0Id, haulId, listingId) {
    try {
        if (!isIdValid(haulId) || !isIdValid(listingId)) return null;

        const inserted = await UserModel.findOneAndUpdate(
            { auth0Id, "hauls._id": haulId },
            { $pull: { "hauls.$.listings": listingId } },
            {
                projection: {
                    hauls: 0,
                    listingsContributed: 0,
                    name: 0,
                    auth0Id: 0,
                    currency: 0,
                    numberOfQualityChecks: 0,
                },
            }
        );
        return inserted;
    } catch (err) {
        console.log("ERROR trying to create haul.  ", err);
    }
}

module.exports = {
    createHaul,
    removeHaul,
    getHaul,
    getHaulsData,
    addListingToHaul,
    removeListingFromHaul,
};

const UserModel = require("../../models/User");

const { isIdValid } = require("./GeneralUtils");

// Creates a haul and returns { inserted: true/false }
async function createHaul(auth0Id, haulName) {
    try {
        const haul = {
            name: haulName,
            listings: [],
            lastUpdated: new Date(),
        };
        const updatedStatus = await UserModel.updateOne(
            { auth0Id },
            { $push: { hauls: haul } }
        );
        if (updatedStatus.ok === 1) {
            return { inserted: true };
        }
        return { inserted: false };
    } catch (err) {
        console.log("ERROR trying to create haul.  ", err);
    }
}

// Removes a haul and returns { deleted: true/false }
// If haul is not found, returns null
async function removeHaul(auth0Id, haulId) {
    try {
        if (!isIdValid(haulId)) return null;
        const updatedStatus = await UserModel.updateOne(
            { auth0Id },
            { $pull: { hauls: { _id: haulId } } }
        );
        if (updatedStatus.ok === 1) {
            return { deleted: true };
        }
        return { deleted: false };
    } catch (err) {
        console.log("ERROR trying to remove haul.  ", err);
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
        console.log("ERROR trying to get haul.  ", err);
    }
}

// Gets the haul name, id, and number of listings of all the hauls in a user
async function getHaulsData(auth0Id) {
    try {
        const haulsData = await UserModel.aggregate([
            { $match: { auth0Id } },
            { $sort: { "hauls.lastUpdated": -1 } },
            { $unwind: "$hauls" },
            {
                $project: {
                    _id: "$hauls._id",
                    listingSize: {
                        $size: "$hauls.listings",
                    },
                    name: "$hauls.name",
                    lastUpdated: "$hauls.lastUpdated",
                },
            },
        ]);
        return haulsData;
    } catch (err) {
        console.log("ERROR trying to get hauls data.  ", err);
    }
}
// Adds a listing to the users haul.  If successfully inserts, returns user id, otherwise null
async function addListingToHaul(auth0Id, haulId, listingId) {
    try {
        if (!isIdValid(haulId) || !isIdValid(listingId)) return null;

        const inserted = await UserModel.findOneAndUpdate(
            { auth0Id, "hauls._id": haulId },
            {
                $addToSet: { "hauls.$.listings": listingId },
                "hauls.$.lastUpdated": new Date(),
            },
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
        console.log("ERROR trying to add listing to haul.  ", err);
    }
}

// Removes a listing to the users haul.  If successfully removes, returns user id, otherwise null
async function removeListingFromHaul(auth0Id, haulId, listingId) {
    try {
        if (!isIdValid(haulId) || !isIdValid(listingId)) return null;

        const inserted = await UserModel.findOneAndUpdate(
            { auth0Id, "hauls._id": haulId },
            {
                $pull: { "hauls.$.listings": listingId },
                "hauls.$.lastUpdated": new Date(),
            },
            {
                new: true,
                projection: {
                    hauls: { $elemMatch: { _id: haulId } },
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
        console.log("ERROR trying to remove listing from haul  ", err);
    }
}

// Changes a haul name
async function changeHaulName(auth0Id, haulId, newHaulName) {
    try {
        if (!isIdValid(haulId)) return null;

        const inserted = await UserModel.updateOne(
            { auth0Id, "hauls._id": haulId },
            {
                $set: { "hauls.$.name": newHaulName },
            }
        );
        if (inserted.ok === 1 && inserted.nModified === 1) {
            return { updated: true, newName: newHaulName };
        }
        return { updated: false };
    } catch (err) {
        console.log("ERROR trying to remove listing from haul  ", err);
    }
}

module.exports = {
    createHaul,
    removeHaul,
    getHaul,
    getHaulsData,
    addListingToHaul,
    removeListingFromHaul,
    changeHaulName,
};

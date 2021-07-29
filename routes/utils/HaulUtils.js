var ObjectId = require("mongoose").Types.ObjectId;
const UserModel = require("../../models/User");

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
        if (!ObjectId.isValid(haulId)) {
            return null;
        }
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
        if (!ObjectId.isValid(haulId)) {
            return null;
        }
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

module.exports = { createHaul, removeHaul, getHaul };

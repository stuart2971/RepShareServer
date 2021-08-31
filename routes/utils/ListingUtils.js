var ObjectId = require("mongoose").Types.ObjectId;
var mongoose = require("mongoose");

const ListingModel = require("../../models/Listing");
const UserModel = require("../../models/User");
const { isIdValid } = require("./GeneralUtils");
const { increaseNumberOfQualityChecks } = require("./UserUtils");

const { scrape } = require("./webscrape");

// Adds a listing (scraped) into db and returns the new doc with the _id
async function addListing(listing) {
    try {
        let scrapedResults = {},
            scrapedData = {},
            images;
        if (!listing.name || !listing.imageURL || !listing.price) {
            scrapedResults = await scrape(listing.link);
            console.log(scrapedResults);
            scrapedData = {
                name: scrapedResults ? scrapedResults.itemName : "",
                imageURL: scrapedResults ? scrapedResults.imageURL : "",
                price: scrapedResults ? scrapedResults.price : "",
            };
            images = scrapedData.imageURL;
        }

        const newListing = new ListingModel({
            name: listing.name || scrapedData.name,
            link: listing.link,
            imageURL:
                listing.imageAddresses.length !== 0
                    ? listing.imageAddresses
                    : scrapedData.imageURL,
            tag: listing.tag,
            price: scrapedData.price,
            qualityChecks: [],
            inHaul: 0,
            createdBy: listing.auth0Id,
            message: listing.message,
            flags: [],
        });
        return new Promise((resolve) => {
            newListing.save(async (err, doc) => {
                if (err) console.log(err);
                await UserModel.updateOne(
                    { auth0Id: listing.auth0Id },
                    { $push: { listingsContributed: doc._id } }
                );
                resolve(doc);
            });
        });
    } catch (err) {
        console.log("ERROR ADDING LISTING ", err);
    }
}

// Checks if a listing exists by its link
async function doesExist(link) {
    try {
        const listing = await ListingModel.findOne({ link }, "_id");
        if (listing) {
            return { _id: listing._id, exists: true };
        }
        return { exists: false };
    } catch (err) {
        console.log("ERROR IN DOES EXIST METHOD ", err);
    }
}

// Gets the entire listing document by id
async function getListing(listingId) {
    try {
        if (!isIdValid(listingId)) return null;

        // const listing = await ListingModel.findOne({ _id: listingId });
        const listing = await ListingModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(listingId) } },
            {
                $project: {
                    createdBy: 1,
                    name: 1,
                    link: 1,
                    imageURL: 1,
                    tag: 1,
                    price: 1,
                    inHaul: 1,
                    message: 1,
                    flags: { $size: "$flags" },
                    qualityChecks: { $slice: ["$qualityChecks", 0, 10] },
                    averageRating: { $avg: "$qualityChecks.rating" },
                },
            },
        ]);

        return listing[0];
    } catch (err) {
        console.log("ERROR IN GET LISTING METHOD ", err);
    }
}

// Gets the listing data from an array of ids
async function getListingsData(listingsArray) {
    try {
        // Since aggregate does not cast the string ids into ObjectIds (like in find()) we have to do it manually ourselves
        listingsArray = listingsArray.map(function (el) {
            return mongoose.Types.ObjectId(el);
        });
        const myListings = await ListingModel.aggregate([
            { $match: { _id: { $in: listingsArray } } },
            { $sort: { _id: -1 } },
            {
                $project: {
                    dateCreated: { $toDate: "$_id" },
                    name: 1,
                    link: 1,
                    price: 1,
                    tag: 1,
                    imageURL: 1,
                    qualityChecks: { $size: "$qualityChecks" },
                    createdBy: 1,
                },
            },
        ]);
        return myListings;
    } catch (err) {
        console.log("ERROR IN GET LISTING DATA METHOD ", err);
    }
}

// Gets the ids of the most recent listings
async function getNewListings(limit, skip) {
    try {
        const newListings = await ListingModel.find({})
            .select("_id")
            .limit(limit)
            .skip(skip)
            .sort({
                _id: -1,
            });
        let idList = [];
        for (let i = 0; i < newListings.length; i++) {
            idList.push(newListings[i]._id);
        }
        return idList;
    } catch (err) {
        console.log("ERROR IN GET LISTING DATA METHOD ", err);
    }
}

// Scrapes the listing
async function scrapeListing(link) {
    try {
        const scrapedData = await scrape(link);
        return scrapedData;
    } catch (err) {
        console.log("ERROR IN SCRAPING LISTING ", err);
    }
}

// Deletes the listing
async function deleteListing(listingId, auth0Id) {
    try {
        if (!isIdValid(listingId)) return null;

        const deleted = await ListingModel.deleteOne({ _id: listingId });
        const removedFromUserModel = await UserModel.updateOne(
            { auth0Id },
            {
                $pull: { listingsContributed: listingId },
            }
        );
        if (
            deleted.ok === 1 &&
            deleted.n === 1 &&
            removedFromUserModel.nModified === 1 &&
            removedFromUserModel.ok === 1
        ) {
            return { deleted: true };
        }
        return { deleted: false };
        // return scrapedData;
    } catch (err) {
        console.log("ERROR IN DELETING LISTING ", err);
    }
}

async function editListing(listingId, newListing) {
    try {
        if (!isIdValid(listingId)) return null;

        const edited = await ListingModel.updateOne(
            { _id: listingId },
            newListing
        );
        if (edited.ok === 1 && edited.nModified === 1) {
            return { edited: true };
        }
        return { edited: false };
    } catch (err) {
        console.log("ERROR IN EDITING LISTING ", err);
    }
}

async function addQualityCheck(listingId, qualityCheck) {
    try {
        if (!isIdValid(listingId)) return null;

        const edited = await ListingModel.updateOne(
            { _id: listingId },
            { $push: { qualityChecks: qualityCheck } }
        );
        const updatedUser = await increaseNumberOfQualityChecks(
            qualityCheck.auth0Id
        );
        if (edited.ok === 1 && edited.nModified === 1 && updatedUser.updated)
            return { updated: true };
        return { updated: false };
    } catch (err) {
        console.log("ERROR IN ADDING QUALITY CHECK IN LISTING ", err);
    }
}

async function deleteComment(listingId, commentId) {
    try {
        if (!isIdValid(listingId)) return null;

        const edited = await ListingModel.updateOne(
            { _id: listingId },
            { $pull: { qualityChecks: { _id: commentId } } }
        );

        if (edited.ok === 1 && edited.nModified === 1) return { deleted: true };
        return { deleted: false };
    } catch (err) {
        console.log("ERROR DELETING COMMENT IN LISTING ", err);
    }
}

async function flagListing(listingId, auth0Id) {
    const MAX_FLAGS = 5;

    try {
        if (!isIdValid(listingId)) return null;

        const flags = await ListingModel.findOne({ _id: listingId }, "flags");
        // Deletes the listing if there is one less than the max (when called it would be the last flag)
        if (flags.flags.length === MAX_FLAGS - 1) {
            const deletedListing = await deleteListing(listingId);
            return deletedListing;
        } else {
            const updated = await ListingModel.updateOne(
                { _id: listingId },
                {
                    $addToSet: { flags: auth0Id },
                }
            );
            if (updated.ok === 1 && updated.nModified === 1)
                return { updated: true };
        }
        return { updated: false };
    } catch (err) {
        console.log("ERROR FLAGGING LISTING ", err);
    }
}

async function findListing(listingName) {
    try {
        var searchKey = new RegExp(listingName, "i");

        const listings = await ListingModel.find({ name: searchKey })
            .select("name _id")
            .limit(10);

        return listings;
    } catch (err) {
        console.log("ERROR IN ADDING QUALITY CHECK IN LISTING ", err);
    }
}

module.exports = {
    addListing,
    doesExist,
    getListing,
    getListingsData,
    getNewListings,
    scrapeListing,
    deleteListing,
    editListing,
    addQualityCheck,
    deleteComment,
    flagListing,
    findListing,
};

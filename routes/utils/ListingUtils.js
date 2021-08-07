var ObjectId = require("mongoose").Types.ObjectId;
var mongoose = require("mongoose");

const ListingModel = require("../../models/Listing");
const UserModel = require("../../models/User");
const { isIdValid } = require("./GeneralUtils");

const { scrape, scrapeImgur } = require("./webscrape");

// Adds a listing (scraped) into db and returns the new doc with the _id
async function addListing(listing) {
    try {
        const scrapedResults = await scrape(listing.link);
        const scrapedData = {
            name: scrapedResults ? scrapedResults.name : "",
            imageURL: scrapedResults ? scrapedResults.imageURL : "",
            price: scrapedResults ? scrapedResults.price : "",
        };
        let images = [];
        if (listing.imageURL) {
            images = await scrapeImgur(listing.imageURL);
        }

        const newListing = new ListingModel({
            name: listing.name || scrapedData.name,
            link: listing.link,
            imageURL: images,
            tag: listing.tag,
            price: scrapedData.price,
            qualityChecks: [],
            inHaul: 0,
            createdBy: listing.auth0Id,
            message: listing.message,
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

        const listing = await ListingModel.findOne({ _id: listingId });
        return listing;
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
            {
                $project: {
                    dateCreated: { $toDate: "$_id" },
                    name: 1,
                    link: 1,
                    price: 1,
                    tag: 1,
                    imageURL: 1,
                    qualityChecks: { $size: "$qualityChecks" },
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

module.exports = {
    addListing,
    doesExist,
    getListing,
    getListingsData,
    getNewListings,
};

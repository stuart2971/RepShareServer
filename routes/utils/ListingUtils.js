var ObjectId = require("mongoose").Types.ObjectId;

const ListingModel = require("../../models/Listing");
const UserModel = require("../../models/User");
const { isIdValid } = require("./GeneralUtils");

const { scrape } = require("./webscrape");

// Adds a listing (scraped) into db and returns the new doc with the _id
async function addListing(listing) {
    try {
        const scrapedData = await scrape(listing.link);

        const newListing = new ListingModel({
            name: listing.name || scrapedData.name,
            link: listing.link,
            imageURL: [listing.imageURL] || scrapedData.imageURL,
            tag: listing.tag,
            price: scrapedData ? scrapedData.price : "",
            qualityChecks: [],
            inHaul: 0,
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
async function getListingData(listingsArray) {
    try {
        const myListings = await ListingModel.find({
            _id: {
                $in: listingsArray,
            },
        });
        return myListings;
    } catch (err) {
        console.log("ERROR IN GET LISTING DATA METHOD ", err);
    }
}

module.exports = { addListing, doesExist, getListing, getListingData };

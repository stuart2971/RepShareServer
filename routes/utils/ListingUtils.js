var ObjectId = require("mongoose").Types.ObjectId;

const ListingModel = require("../../models/Listing");
const UserModel = require("../../models/User");

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

async function getListing(listingId) {
    try {
        if (!ObjectId.isValid(listingId)) {
            return null;
        }
        const listing = await ListingModel.findOne({ _id: listingId });
        return listing;
    } catch (err) {
        console.log("ERROR GET LISTING METHOD ", err);
    }
}

module.exports = { addListing, doesExist, getListing };

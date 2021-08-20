var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const Listing = new Schema({
    createdBy: String,
    name: String,
    link: String,
    imageURL: [String],
    tag: String,
    price: String,
    inHaul: Number,
    message: String,
    qualityChecks: [
        {
            name: String,
            auth0Id: String,
            comment: String,
            rating: Number,
        },
    ],
});

module.exports = mongoose.model("Listing", Listing);

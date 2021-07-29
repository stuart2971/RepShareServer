var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const Listing = new Schema({
    name: String,
    link: String,
    imageURL: [String],
    tag: String,
    price: String,
    inHaul: Number,
    qualityChecks: [
        {
            imgurLink: String,
            comment: String,
            rating: Number,
        },
    ],
});

module.exports = mongoose.model("Listing", Listing);

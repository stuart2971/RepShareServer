var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const User = new Schema({
    name: String,
    auth0Id: String,
    currency: String,
    numberOfQualityChecks: Number,
    hauls: [
        {
            name: String,
            listings: [Schema.Types.ObjectId],
        },
    ],
    listingsContributed: [Schema.Types.ObjectId],
});

module.exports = mongoose.model("User", User);

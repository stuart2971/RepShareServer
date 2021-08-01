var ObjectId = require("mongoose").Types.ObjectId;

// Checks if _id is valid (you may think this is a worthless and unncessary
// function but it saves a few lines by printing the message if its invalid)
function isIdValid(id) {
    if (ObjectId.isValid(id)) return true;
    else {
        console.log(id + " is not a valid ObjectId");
        return false;
    }
}

module.exports = { isIdValid };

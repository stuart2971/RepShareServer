require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { scrape } = require("./routes/utils/webscrape");

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", require("./routes/UserRoutes"));
app.use("/listing", require("./routes/ListingRoutes"));
app.use("/haul", require("./routes/HaulRoutes"));

app.listen(process.env.PORT, () => {
    console.log("Running on port " + process.env.PORT);
});

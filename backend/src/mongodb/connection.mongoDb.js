const mongoose = require("mongoose");
const configData = require("../configs/congig");

const connectionWithDb = async () => {
    await mongoose.connect(configData.MONGODBURL).then(() => {
        console.log("Database is connect successfully");
    }).catch((err) => {
        console.log("Error occur during connection with DB");
    })
}

module.exports = connectionWithDb;
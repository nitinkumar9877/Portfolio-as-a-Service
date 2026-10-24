const dotenv = require("dotenv")
dotenv.config();

if (!process.env.PORT) {
    throw new Error("PORT is never define in the enviornment variable");
}

if (!process.env.MONGODBURL) {
    throw new Error("MONGODBURL is never define in the enviornment variable");
}

if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is never define in the enviornment variable");
}

if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is never define in the enviornment variable");
}

const configData = {
    PORT: process.env.PORT,
    MONGODBURL: process.env.MONGODBURL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
}
module.exports = configData;
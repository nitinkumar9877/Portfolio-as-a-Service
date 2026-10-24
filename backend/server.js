const app = require("./src/app");
const configData = require("./src/configs/congig");
const connectionWithDb = require("./src/mongodb/connection.mongoDb.js")

connectionWithDb();

app.listen(configData.PORT, () => {
    console.log("server is listen at port : ",configData.PORT)
})
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const url = "mongodb+srv://songhyojun:jySM0DpoGblpnTIW@songhyojun.tvwku08.mongodb.net/";

let mydb;

MongoClient
  .connect(url)
  .then((client) => {
    console.log("Connected to MongoDB");
    mydb = client.db("User");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

function getDb() {
  if (!mydb) {
    throw {
      message: "먼저 연결 ㄱㄱ",
    };
  }
  return mydb;
}

module.exports = {
  getDb,
};

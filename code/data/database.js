const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;
const url = "mongodb+srv://songhyojun:jySM0DpoGblpnTIW@songhyojun.tvwku08.mongodb.net/";

let database;

async function connect() {
  const client = await MongoClient.connect(url);
  console.log('Connected to MongoDB');
  database = client.db('User');
}

function getDb() {
  if (!database) {
    throw { message: 'Database connection not established!' };
  }
  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb
};

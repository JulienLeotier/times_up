const { Client } = require('pg')

const connectionString = 'postgresql://dbuser:secretpassword@127.0.0.1:5432/mydb'

const client = new Client({
    connectionString: connectionString,
});

client.connect();

module.exports = client;
require('./model');
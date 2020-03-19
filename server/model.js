const client = require('./connection')

const createTableWord = () => {
    const queryText = `
      CREATE TABLE IF NOT EXISTS
      word(
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) NOT NULL
      )`;
    client.query(queryText, (err, res) => {
        if (err) {
            throw err;
        }
    })
}
const createTableWordAll = () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS
    all_word(
      id SERIAL PRIMARY KEY,
      word VARCHAR(255) NOT NULL
    )`;
    client.query(queryText, (err, res) => {
        if (err) {
            throw err;
        }
    })
}

const createTablePendingWord = () => {
    const queryText = `
  CREATE TABLE IF NOT EXISTS
  pending_word(
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL
  )`;
    client.query(queryText, (err, res) => {
        if (err) {
            throw err;
        }
    })
}

const createTablefoundWord = () => {
    const queryText = `
CREATE TABLE IF NOT EXISTS
found_word(
  id SERIAL PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  player INTEGER NOT NULL
)`;
    client.query(queryText, (err, res) => {
        if (err) {
            throw err;
        }
    })
}

const createTablePlayer = () => {
    const queryText = `
CREATE TABLE IF NOT EXISTS
player(
id SERIAL PRIMARY KEY,
player VARCHAR(255) NOT NULL
)`;
    client.query(queryText, (err, res) => {
        if (err) {
            throw err;
        }
    })
}
const createTableScore = () => {
    const queryText = `
CREATE TABLE IF NOT EXISTS
score(
id SERIAL PRIMARY KEY,
player INTEGER NOT NULL,
score_id INTEGER NOT NULL
)`;
    client.query(queryText, (err, res) => {
        if (err) {
            throw err;
        }
    })
}
createTableWord();
createTablePendingWord();
createTablefoundWord();
createTablePlayer();
createTableScore();
createTableWordAll();
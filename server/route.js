const express = require('express')
const app = express()
const api = require('./api')

const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)
app.use(express.static('app'));


app.get('/word', api.getWord);
app.get('/one_word', api.getOneWord);
app.post('/add_word', api.addWord);
app.post('/add_pending_word', api.addPendingWord);


// player

app.post('/create_player', api.createPlayer);
app.get('/score/:id', api.getPlayerScore);
app.get('/word_player/:id', api.getPlayerWord);

// Player win

app.post('/add_found_word', api.addWordFound);

module.exports = app;
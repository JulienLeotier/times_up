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


app.get('/one_word', api.getOneWord);
app.post('/add_word', api.addWord);


// player

app.post('/create_player', api.createPlayer);
app.get('/score/:id', api.getPlayerScore);

// Player win

app.post('/add_found_word', api.addWordFound);

// end of turn 

app.post('/end_turn', api.endOfTurn);

app.get('/favicon.ico', (req, res) => {
    res.send('favicon.ico')
})
app.get('/role', api.princess_legend);
app.get('/addRole', api.resetRole)
module.exports = app;
const client = require('./connection');

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 40510 })

wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('pong', () => {
        this.isAlive = true;
    });
});

const addWord = async(req, res) => {
    let word = await client.query('INSERT INTO word(word) VALUES($1) RETURNING *', [req.body.word])
    await client.query('INSERT INTO all_word(word) VALUES($1) RETURNING *', [req.body.word])
    console.log(word.rows[0])
    return res.status(200).json(word.rows[0])
}

const getOneWord = async(req, res) => {
    let word = await client.query('SELECT * FROM word ORDER BY RANDOM() LIMIT 1')
    if (word.rows.length === 0) {
        let pending_word = await client.query('SELECT * FROM pending_word ORDER BY RANDOM() LIMIT 1');
        if (pending_word.rows.length === 0) {
            let message = await endofManche()
            return res.status(200).json(message)
        } else {
            return res.status(200).json(pending_word.rows[0])
        }
    } else {
        await client.query('DELETE FROM word WHERE id = $1', [word.rows[0].id])
        let pending_word = await client.query('INSERT INTO pending_word(word) VALUES($1) RETURNING *', [word.rows[0].word])
        return res.status(200).json(pending_word.rows[0])
    }
}

const endOfTurn = async(req, res) => {
    let pending_word = await client.query('SELECT * FROM pending_word');
    await client.query('DELETE FROM pending_word');
    for (let i = 0; i < pending_word.rows.length; i++) {
        console.log(pending_word.rows[i])
        await client.query('INSERT INTO word( word ) VALUES($1)', [pending_word.rows[i].word])
    }
    return res.status(200).json({ message: "turn is done" })
}

const addWordFound = async(req, res) => {
    await client.query('INSERT INTO found_word( word, player ) VALUES($1, $2)', [req.body.word, req.body.player]);
    let score = await client.query('SELECT * FROM score WHERE score.player = $1', [req.body.player]);
    await client.query('UPDATE score SET score = $1 WHERE player = $2', [score.rows[0].score + 1, req.body.player])
    await client.query('DELETE FROM pending_word WHERE pending_word.id = $1', [req.body.id])
    return res.status(200).json(score.rows[0])
}


const getPlayerScore = async(req, res) => {
    let score = await client.query('SELECT * FROM score, player WHERE score.player = $1', [req.params.id]);
    return res.status(200).json(score.rows[0])
}


const createPlayer = (req, res) => {
    client.query('INSERT INTO player(player) VALUES($1) returning *', [req.body.name], (err, result) => {
        if (err) { throw err }
        client.query('INSERT INTO score(player, score) VALUES($1, $2)', [result.rows[0].id, 0], (err, result) => {
            if (err) { throw err }
        })
        return res.status(200).json(result.rows[0])
    })
}

const endofManche = async() => {
    let all_word = await client.query('SELECT * from all_word')
    await client.query('DELETE FROM pending_word');
    await client.query('DELETE FROM word');
    await client.query('DELETE FROM found_word');
    for (let i = 0; i < all_word.rows.length; i++) {
        console.log(all_word)
        await client.query('INSERT INTO word(word) VALUES($1)', [all_word.rows[i].word]);
    }
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
        ws.send('Nouvelle manche')
    });
    return { message: 'manche fini' }
}

const princess_legend = async(req, res) => {
    const role = await client.query('SELECT * FROM role ORDER BY RANDOM() LIMIT 1');
    await client.query('DELETE FROM role WHERE id = $1', [role.rows[0].id])
    return res.status(200).json(role.rows[0])
}

const resetRole = async(req, res) => {
    await client.query('insert into role(personage) VALUES($1)', ['princess']);
    await client.query('insert into role(personage) VALUES($1)', ['fee']);
    await client.query('insert into role(personage) VALUES($1)', ['la méchante reine']);
    await client.query('insert into role(personage) VALUES($1)', ['le garde']);
    await client.query('insert into role(personage) VALUES($1)', ['le chat']);
    await client.query('insert into role(personage) VALUES($1)', ['espion']);
    await client.query('insert into role(personage) VALUES($1)', ['la servante']);

    return res.status(200).json('le role est reset');

}
module.exports = {
    addWord,
    getOneWord,
    endOfTurn,
    addWordFound,
    createPlayer,
    getPlayerScore,
    princess_legend,
    resetRole
}
const client = require('./connection');
var path = require('path');



const getTime = (request, response) => {
    client.query('SELECT NOW()', (err, result) => {
        if (err) {
            throw err;
        }
        response.status(200).json(result.rows)
    })
}

const addWord = (req, res) => {
    const text = `
    INSERT INTO
    word
    (
      word
    )
    VALUES
    (
      $1
    )
    returning *
    `;
    const values = [
        req.body.word
    ];
    client.query(text, values, (err, result) => {
        if (err) {
            throw err;
        }
        client.query(`
        INSERT INTO word(word) VALUES( $1)`, [req.body.word], (err, result) => {
            if (err) {
                throw err;
            }
        })
        return res.status(200).json(result.rows)
    })
}

const addPendingWord = (req, res) => {
    const text = `
  INSERT INTO
  pending_word
  (
    word
  )
  VALUES
  (
    $1
  )
  returning *
  `;
    const values = [
        req.body.word
    ];
    client.query(text, values, (err, result) => {
        if (err) {
            throw err;
        }
        return res.status(200).json(result.rows)
    })
}

const getWord = (req, res) => {
    const text = `
      SELECT 
      * 
      FROM
      word
    `
    client.query(text, (err, result) => {
        if (err) {
            throw err;
        }
        return res.status(200).json(result.rows)
    })
}

const getOneWord = (req, res) => {
    const text = `
    SELECT 
    * 
    FROM
    word
    ORDER 
    BY RANDOM() 
    LIMIT 1
  `
    client.query(text, (err, result) => {
        if (err) {
            throw err;
        }
        if (result.rows.length === 0) {
            return endofManche()
        }
        client.query('DELETE FROM word WHERE word.id = $1', [result.rows[0].id], (err, ray) => {
            if (err) {
                throw err;
            }
            client.query('INSERT INTO pending_word( word ) VALUES($1)', [result.rows[0].word], (err, result) => {
                if (err) {
                    throw err;
                }
            })
        })
        return res.status(200).json(result.rows[0])
    })
}

const endOfTurn = (req, res) => {
    client.query('SELECT * FROM pending_word', (err, result) => {
        for (let pending in result.rows) {
            client.query('DELETE FROM pending_word WHERE pending_word.id = $1', [pending.id], (err, result) => {
                if (err) {
                    throw err;
                }
                client.query('INSERT INTO word( word ) VALUES($1)', [pending.word], (err, result) => {
                    if (err) {
                        throw err;
                    }
                })
            })
        }
    })
}

const addWordFound = (req, res) => {
    client.query('INSERT INTO found_word( word, player ) VALUES($1, $2)', [req.body.word, req.body.player], (err, result) => {
        if (err) {
            throw err;
        }
        client.query('SELECT * FROM score WHERE score.player = $1', [req.body.player], (err, result) => {
            if (err) {
                throw err;
            }
            client.query('UPDATE score SET score = $1 WHERE player = $2', [result.rows[0].score + 1, req.body.player], (err, result) => {
                if (err) {
                    throw err;
                }
            })
        })
        client.query('DELETE FROM pending_word WHERE pending_word.id = $1', [req.body.id], (err, result) => {
            if (err) {
                throw err;
            }
        })
    })
    return res.status(200).json('word add')

}

const getPlayerWord = (req, res) => {
    client.query('SELECT * FROM found_word WHERE found_word.player = $1', [req.params.id], (err, result) => {
        if (err) { throw err }
        return res.status(200).json(result.rows)
    })
}

const getPlayerScore = (req, res) => {
    client.query('SELECT * FROM score, player WHERE score.player = $1', [req.params.id], (err, result) => {
        if (err) { throw err }
        return res.status(200).json(result.rows[0])
    })
}

const createPlayer = (req, res) => {
    console.log(req.body)
    client.query('INSERT INTO player(player) VALUES($1) returning *', [req.body.name], (err, result) => {
        if (err) { throw err }
        client.query('INSERT INTO score(player, score) VALUES($1, $2)', [result.rows[0].id, 0], (err, result) => {
            if (err) { throw err }
        })
        return res.status(200).json(result.rows[0])
    })
}

const endofManche = () => {
    client.query('SELECT * from all_word', (err, result) => {
        if (err) {
            throw err
        }
        client.query('DELETE FROM pending_word', (err, result) => {
            if (err) { throw err }
        })
        client.query('DELETE FROM word', (err, result) => {
            if (err) { throw err }
        })
        client.query('DELETE FROM found_word', (err, result) => {
            if (err) { throw err }
        })
        for (let word in result.rows) {
            const text = `
            INSERT INTO
            word
            (
            word
            )
            VALUES
            (
            $1
            )
            returning *
            `;
            const values = [
                word
            ];
            client.query(text, values, (err, result) => {
                if (err) {
                    throw err;
                }
            })
        }

    })
    return res.status(200).json({ response: 'manche ok' })
}

const html = (req, res) => {
    res.sendFile(path.join(__dirname + '/test/index.html'));
}
module.exports = {
    getTime,
    addWord,
    addPendingWord,
    getWord,
    getOneWord,
    endOfTurn,
    addWordFound,
    getPlayerWord,
    createPlayer,
    getPlayerScore,
    html
}
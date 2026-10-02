const express = require('express')
const app = express()

// POST METHODS
app.post('/api/games', function(req, res) {
    res.send('Hello Geeks')
})

app.post('/api/games/:id/hit', function(req, res) {
    res.send('Hello Geeks')
})

app.post('/api/games/:id/stand', function(req, res) {
    res.send('Hello Geeks')
})


// GET METHODS
app.get('/api/games/:id', function(req, res) {
    res.send('Hello Geeks')
})
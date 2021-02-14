const express = require('express')
const app = express()
const port = 8000
const path = require('path')
const axios = require('axios')

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/app.js', (req, res) => {
	res.sendFile(path.join(__dirname + '/app.js'))
})

app.get('/song', (req, res) => {
	const id = axios.get('http://localhost:9000/id')
	const time = axios.get('http://localhost:9000/time')
	axios.all([id, time]).then(axios.spread((...responses) => {
		res.send({
			id: responses[0].data.id,
			currentTime: responses[1].data.currentTime
		})
	}))
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

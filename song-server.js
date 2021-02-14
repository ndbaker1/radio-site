const express = require('express')
const app = express()
const port = 9000
const fs = require('fs')

let currentSongId = ''
let playbackStartTime = 0

function playSong(songIndex) {
	// read file and get duration
	currentSongId = '1CU112QR3Lr81v32VaO9e6HLOOCi3FnjY'
	const songDuration = 200 * 1000
	playbackStartTime = Date.now()
	setTimeout(() => {
		playSong(0)
	}, songDuration)
}
playSong(0)

app.get('/id', (req, res) => {
	res.send({ id: currentSongId })
})

app.get('/time', (req, res) => {
	// convert from milliseconds to seconds
	const songPosition = (Date.now() - playbackStartTime) / 1000
	res.send({ currentTime: songPosition })
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

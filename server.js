const express = require('express')
const app = express()
const port = 8000
const fs = require('fs')
const path = require('path')

// soruce serving routes
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/app.js', (req, res) => {
	res.sendFile(path.join(__dirname + '/app.js'))
})

// api routes
let currentSongId = ''
let currentSongName = ''
let playbackStartTime = 0
let playCallback = null
const songs = JSON.parse(fs.readFileSync('./songlist.json', { encoding: 'utf-8' }))

function playSong(songIndex) {
	// read file and get duration
	currentSongId = songs[songIndex].id
	currentSongName = songs[songIndex].name
	// read song from url
	const songDuration = 200 * 1000
	// reset playback start time
	playbackStartTime = Date.now()
	playCallback = setTimeout(() => {
		playSong(Math.round(Math.random() * songs.length))
	}, songDuration)
}
playSong(Math.round(Math.random() * songs.length))

app.get('/song', (req, res) => {
	// convert from milliseconds to seconds
	const songPosition = (Date.now() - playbackStartTime) / 1000
	res.send({
		name: currentSongName,
		id: currentSongId,
		currentTime: songPosition
	})
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

const fs = require('fs')
const express = require('express')
const app = express()
const localtunnel = require('localtunnel')
const subdomain = 'ramensongs'
const port = 8000

// soruce serving routes
app.use(express.static('public'))

// api routes
let currentSongId = ''
let currentSongName = ''
let playbackStartTime = 0
let songTimeout = null

// helper logging functions
const log = {
	songStart: () => console.log('[Started Broadcast] >> ' + currentSongName),
	skip: () => console.log('[Skipping] >> ' + currentSongName)
}
const gdriveSource = (gdriveId) => "https://docs.google.com/uc?export=download&id=" + gdriveId

const songs = JSON.parse(fs.readFileSync('./songlist.json', { encoding: 'utf-8' }))

function playSong(songIndex) {
	// read file and get duration
	currentSongId = songs[songIndex].id
	currentSongName = songs[songIndex].name
	log.songStart()
	// read song from url
	const songDuration = 20 * 1000
	// reset playback start time
	playbackStartTime = Date.now()
	songTimeout = setTimeout(() => {
		playSong(Math.round(Math.random() * songs.length))
	}, songDuration)
}

app.get('/song', (req, res) => {
	// convert from milliseconds to seconds
	const songPosition = (Date.now() - playbackStartTime) / 1000
	res.send({
		name: currentSongName,
		id: currentSongId,
		currentTime: songPosition
	})
})

app.get('/skip', (req, res) => {
	clearTimeout(songTimeout)
	log.skip()
	playSong(Math.round(Math.random() * songs.length))
	res.send()
})


// start server
app.listen(port, async () => {
	console.log(`Song Server listening on http://localhost:${port}`)
	const tunnel = await localtunnel({port, subdomain})
	console.log(`Public tunnel setup at ${tunnel.url}\n`)
	playSong(Math.round(Math.random() * songs.length))
})

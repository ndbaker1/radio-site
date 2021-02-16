import express from 'express'
import localtunnel from 'localtunnel'
import { readFileSync } from 'fs'

/**
 * CONFIGURATIONS
 */
const subdomain = 'ramensongs'
const port = 8000
const songlistPath = './songlist.json'

/**
 * Express Setup
 */
const app = express()
// use the NextJS static export folder to serve content
app.use(express.static('out'))

/**
 * Song Managment Setup
 */
let currentSongId = ''
let currentSongName = ''
let playbackStartTime = 0
let songTimeout: NodeJS.Timeout

// helper logging functions
const log = {
	songStart: () => console.log('[Started Broadcast] >> ' + currentSongName),
	skip: () => console.log('[Skipping] >> ' + currentSongName)
}

const songs = JSON.parse(readFileSync(songlistPath, { encoding: 'utf-8' }))

function playSong(songIndex: number) {
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

/**
 *  API Routes
 */
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

/**
 * Express Server Start
 */
app.listen(port, async () => {
	console.log(`Song Server listening on http://localhost:${port}`)
	const tunnel = await localtunnel({ port, subdomain })
	console.log(`Public tunnel setup at ${tunnel.url}\n`)
	playSong(Math.round(Math.random() * songs.length))
})
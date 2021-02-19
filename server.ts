import express from 'express'
import localtunnel from 'localtunnel'
import { readFileSync } from 'fs'

/**
 * CONFIGURATIONS
 */
const subdomain = process.argv[2] || 'music-radio'
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

const songs: Array<{ id: string, name: string }> = JSON.parse(readFileSync(songlistPath, { encoding: 'utf-8' }))

function playSong() {
	const songIndex = Math.round(Math.random() * (songs.length - 1))
	// read file and get duration
	currentSongId = songs[songIndex].id
	currentSongName = songs[songIndex].name
		// remove extension name
		.substring(0, songs[songIndex].name.lastIndexOf('.'))
	// read song from url
	const songDuration = 20 * 1000 // TODO  - THIS NEEDS TO BE UPDATES TO REFLECT THE DURATION OF THE SONG
	// reset playback start time
	playbackStartTime = Date.now()
	songTimeout = setTimeout(playSong, songDuration)
	console.log('[Playing]', currentSongName)
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
	console.log('[Skipping]')
	clearTimeout(songTimeout)
	playSong()
	res.send()
})

/**
 * Express Server Start
 */
let tunnel: localtunnel.Tunnel

const server = app.listen(port, async () => {
	console.log(`Song Server listening on http://localhost:${port}`)
	tunnel = await localtunnel({ port, subdomain })
	console.log(`Public tunnel setup at ${tunnel.url}\n`)
	playSong()
})

/**
 * Gracefully handle shutdown
 */
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

function shutdown() {
	console.log('Shutting down localtunnel...')
	tunnel.close()
	console.log('Shutting down express...')
	server.close()
}
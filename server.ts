import express from 'express'
import localtunnel from 'localtunnel'
import { GoogleDriveMusicPlayer } from './utils/musicAdapter'

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
 * Song Managment
 */
const musicPlayer = new GoogleDriveMusicPlayer(songlistPath)

/**
 *  API Routes
 */
app.get('/song', (req, res) => {
	res.send(musicPlayer.getState())
})

app.get('/skip', (req, res) => {
	res.send(musicPlayer.skipSong())
})

/**
 * Express Server Start
 */
let tunnel: localtunnel.Tunnel

const server = app.listen(port, () => {
	console.log(`Song Server listening on http://localhost:${port}`)
	localtunnel({ port, subdomain }).then((activeTunnel) => {
		tunnel = activeTunnel
		console.log(`Public tunnel setup at ${tunnel.url}\n`)
		musicPlayer.playSong()
	})
})

/**
 * Gracefully handle shutdown
 */
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

function shutdown() {
	console.log('\nShutting down localtunnel...')
	tunnel.close()
	console.log('Shutting down express...')
	server.close()
	console.log('Cleaning up music player resouces...')
	musicPlayer.cleanup()
}
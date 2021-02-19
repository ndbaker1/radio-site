import express from 'express'
import localtunnel from 'localtunnel'
import socketIO from 'socket.io'
import { GoogleDriveMusicPlayer, MusicState } from './utils/music.adapter'

/**
 * CONFIGURATIONS
 */
const subdomain = process.argv[2] || 'music-radio'
const port = 8000
const songlistPath = './songlist.json'
const musicPlayer = new GoogleDriveMusicPlayer(songlistPath)

async function initialize() {
	/**
	 * Server Setup
	 */
	const app = express()
	// use the NextJS static export folder to serve content
	app.use(express.static('out'))

	const server = app.listen(port, () => {
		console.log(`Song Server listening on http://localhost:${port}`)
	})
	const tunnel = await localtunnel({ port, subdomain })
	console.log(`Public tunnel setup at ${tunnel.url}\n`)

	const io = socketIO(server)
	io.on('connection', (socket) => {
		console.log('User Connected')
	})

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
	 * Web Socket Setup
	 */
	musicPlayer.playSongCallback = (state: MusicState) => {
		io.emit('music-state', state)
	}

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
		console.log('Shutting down socket.io...')
		io.close()
		console.log('Cleaning up music player resouces...')
		musicPlayer.cleanup()
	}
}

initialize().then(() => {
	musicPlayer.playSong()
})


import express from 'express'
import cors from 'cors'
import localtunnel from 'localtunnel'
import { Socket, Server } from 'socket.io'
import { GoogleDriveMusicPlayer } from './adapters/google-drive-music.adapter'
import socketEvents from './libs/socket.events'

/**
 * CONFIGURATIONS
 */
const subdomain = process.argv[2] || 'music-radio'
const port = 8000
const songlistPath = './songlist.json'
const musicPlayer = new GoogleDriveMusicPlayer(songlistPath)

/**
 * INIT FUNCTION
 */
async function initialize() {
	/**
	 * Tracking Data
	 */
	const connectedClients = new Array<Socket>()

	/**
	 * Server Setup
	 */
	const app = express()
	// use the NextJS static export folder to serve content
	app.use(express.static('out'))
	app.use(cors())

	const server = app.listen(port, () => {
		console.log(`Song Server listening on http://localhost:${port}`)
	})
	const tunnel = await localtunnel({ port, subdomain })
	console.log(`Public tunnel setup at ${tunnel.url}\n`)

	const io: Server = require('socket.io')(server)
	io.on('connection', (socket: Socket) => {
		console.log('[User Connected]', socket.id)

		connectedClients.push(socket)
		io.emit(socketEvents.connectedUsers, connectedClients.map(socket => socket.id))

		socket.emit(socketEvents.musicState, musicPlayer.getState())

		socket.on('disconnect', () => {
			console.log('[User Disconnected]', socket.id)
			connectedClients.splice(connectedClients.indexOf(socket), 1)
			io.emit(socketEvents.connectedUsers, connectedClients.map(socket => socket.id))
		})
	})

	/**
	 *  API Routes
	 */
	app.get('/song', (req, res) => {
		res.send(musicPlayer.getState())
	})

	app.get('/next', (req, res) => {
		res.send(musicPlayer.nextSong())
	})

	/**
	 * Web Socket Setup
	 */
	musicPlayer.playSongCallback = (state) => {
		io.emit(socketEvents.musicState, state)
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
	}
}

/**
 * INIT AND RUN
 */
initialize().then(() => {
	musicPlayer.playSong()
})


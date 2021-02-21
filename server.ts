import express from 'express'
import cors from 'cors'
import localtunnel from 'localtunnel'

import { Socket, Server } from 'socket.io'
import streamEvents from './libs/socket.events'

import { GoogleDriveMusicPlayer } from './adapters/google-drive-music.adapter'

/**
 * CONFIGURATIONS
 */
const subdomain = process.argv[2] || 'music-radio'
const port = +process.argv[3] || 8000
const songlistPath = './songlist.json'
const musicPlayer = new GoogleDriveMusicPlayer(songlistPath)

/**
 * INIT FUNCTION
 */
async function initialize() {
	/**
	 * Tracking Data
	 */
	const connectedClients = new Map<Socket, string>()

	/**
	 * Server Setup
	 */
	const app = express()
	app.use(cors())
	// use the NextJS static export folder to serve content
	app.use(express.static('out'))

	const server = app.listen(port, () => {
		console.log(`Song Server listening on http://localhost:${port}`)
	})
	const tunnel = await localtunnel({ port, subdomain })
	console.log(`Public tunnel setup at ${tunnel.url}\n`)

	const io: Server = require('socket.io')(server)
	io.on('connection', (socket: Socket) => {
		// first time connection
		console.log('[User Connected]', socket.id)
		connectedClients.set(socket, socket.id)
		io.emit(streamEvents.connectedUsersUpdate, Array.from(connectedClients.values()))
		socket.emit(streamEvents.songListUpdate, musicPlayer.songs.map(song => song.name))
		socket.emit(streamEvents.musicStateUpdate, musicPlayer.getState())
		// update name when user changes
		socket.on(streamEvents.nameUpdate, (name: string) => {
			connectedClients.set(socket, name)
			io.emit(streamEvents.connectedUsersUpdate, Array.from(connectedClients.values()))
		})
		// remove use from map when disconnected
		socket.on('disconnect', () => {
			console.log('[User Disconnected]', socket.id)
			connectedClients.delete(socket)
			io.emit(streamEvents.connectedUsersUpdate, Array.from(connectedClients.values()))
		})
	})

	/**
	 *  API Routes
	 */
	app.get('/song', (_, res) => {
		res.send(musicPlayer.getState())
	})
	app.get('/next', (_, res) => {
		res.send(musicPlayer.nextSong())
	})
	app.get('/play', (req, res) => {
		res.send(musicPlayer.playSong(req.query.songIndex))
	})

	/**
	 * Web Socket Song Emitter
	 */
	musicPlayer.playSongCallback = (state) => {
		io.emit(streamEvents.musicStateUpdate, state)
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


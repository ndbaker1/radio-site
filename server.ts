// core libs
import express from 'express'
import cors from 'cors'
import localtunnel from 'localtunnel'
// sockets
import { Socket, Server } from 'socket.io'
import streamEvents from './lib/socket.events'
// ui and interface
import inquirer from 'inquirer'
import chalk from 'chalk'
// player
import { MusicPlayer, SongEntry } from './lib/musicplayer'
// filesystem
import { existsSync, readdirSync, readFileSync } from 'fs'

/**
 * COMMAND LINE ARGUMENTS
 */
const subdomain = process.argv[2] || 'music-radio'
const port = +process.argv[3] || 8000
const generateSonglist = process.argv.includes('reload') // quick ability to reload songlist.json

/**
 * CONSTANTS
 */
const SONGLIST_PATH = __dirname + '/songlist.json'
const LOADER_DIR_PATH = __dirname + '/lib/loaders'

/**
 * INIT FUNCTION
 */
async function initialize() {
	/**
	 * Initial Values
	 */
	const songlist: Array<SongEntry> = JSON.parse(readFileSync(SONGLIST_PATH, { encoding: 'utf-8' }))
	const musicPlayer = new MusicPlayer(songlist)
	const connectedClients = new Map<Socket, string>()

	/**
	 * Server Setup
	 */
	const app = express()
	app.use(cors())
	// use the NextJS static export folder to serve content
	app.use(express.static('out'))

	const server = app.listen(port, () => {
		console.log(`Server Listening on ${chalk.green(`http://localhost:${port}`)}`)
	})
	const tunnel = await localtunnel({ port, subdomain })
	console.log(`Public Tunnel Listening on ${chalk.green(tunnel.url)}\n`)

	const io: Server = require('socket.io')(server)
	io.on('connection', (socket: Socket) => {
		// first time connection
		console.log('[User Connected]', socket.id)
		connectedClients.set(socket, socket.id)
		io.emit(streamEvents.connectedUsersUpdate, Array.from(connectedClients.values()))
		socket.emit(streamEvents.songListUpdate, songlist.map(song => song.name))
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
	app.get('/play', (req: { query: { songIndex: string } }, res) => {
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

	return musicPlayer
}

/**
 * Check Songlist needs or wants to be generated,
 * call down to loaders and then run the real start
 */
function start() {
	if (!existsSync(SONGLIST_PATH) || generateSonglist) {
		inquirer.prompt([{
			type: 'list',
			name: 'storagePlatform',
			message: 'Which Storage Platform would you like to generate a songlist.json from?',
			choices: readdirSync(LOADER_DIR_PATH, { withFileTypes: true }).filter(item => item.isDirectory()).map(dir => dir.name)
		}]).then(async (answers: { storagePlatform: string }) => {
			// dynamically load modules defined in the loader directory
			import(LOADER_DIR_PATH + '/' + answers.storagePlatform + '/loader')
				.then(Loader => Loader.saveToFile(SONGLIST_PATH, _start))
		})
	} else {
		_start()
	}

	// the real starter of the show \(￣︶￣*\))
	function _start() {
		initialize().then(musicPlayer => musicPlayer.playSong())
	}
}

start() // ☜(ﾟヮﾟ☜)
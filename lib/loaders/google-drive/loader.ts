import { existsSync, NoParamCallback, PathLike, readFileSync, writeFile } from "fs"
import { Auth, drive_v3, google } from 'googleapis'
import { SongEntry } from '../../musicplayer'
import { authorize } from './quickstart'
import { Spinner } from 'cli-spinner'
import inquirer from "inquirer"
import chalk from "chalk"

const credentialsPath = __dirname + '/credentials.json'

export function saveToFile(filePath: PathLike, callback: NoParamCallback) {
	// safety check on credentials
	if (!existsSync(credentialsPath))
		return console.log('A credentials.json was not found. [place it with the loader for this platform]')
	// parse credentials
	const credentials = JSON.parse(readFileSync(credentialsPath).toString('utf-8'))
	// Authorize a client with credentials, then call the Google Drive API.
	driveAPI(credentials, async (drive) => {
		// prepare folder info & song array
		const musicFolderId = (await inquirer.prompt([{ type: 'input', name: 'folderId', message: 'FolderId from Google Drive to Recursively Search?' }])).folderId
		const songlistJSON = new Array<SongEntry>()
		// create a loading spinner to show the user progress is occuring
		const spinner = new Spinner(chalk.blue('%s') + ' Loading Files from Google Drive...').setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏').start()
		// recursive api search
		searchInFolderId(musicFolderId).then(() => {
			// cleanup the spinner
			spinner.stop(true)
			// write the song entries to a file and do callback
			// log the error and do not call callback if empty songlist
			if (songlistJSON.length > 0)
				writeFile(filePath, JSON.stringify(songlistJSON, null, 2), callback)
			else
				console.log('No Songs were found.')
		})

		/**
		 * Recursively search the folders synchronously with awaits
		 * @param folderId folderId to search on Gdrive
		 */
		async function searchInFolderId(folderId: string, pathname?: string) {
			const res = await drive.files.list({
				pageSize: 1000,
				q: `parents in '${folderId}'`,
				fields: 'nextPageToken, files(id, name, mimeType)',
			})
			if (res?.data?.files?.length) {
				for (const schemaFile of res.data.files) {
					const file = schemaFile as { name: string, id: string, mimeType: string }
					if (['audio/mp3', 'audio/mpeg'].includes(file.mimeType))
						songlistJSON.push({ name: file.name.substring(0, file.name.lastIndexOf('.')), url: `https://docs.google.com/uc?export=download&id=${file.id}` })
					else if (file.mimeType === 'application/vnd.google-apps.folder')
						await searchInFolderId(file.id, pathname ? pathname + '/' + file.name : file.name)
					else
						console.log(`mimeType: ${file.mimeType} not handled.`)
				}
			}
		}
	})
}

// helper to return driveAPI object from auth object
function driveAPI(credentials: Object, callback: (drive: drive_v3.Drive) => void) {
	authorize(credentials, (auth: Auth.OAuth2Client) => {
		callback(google.drive({ version: 'v3', auth }))
	})
}
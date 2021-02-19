import { readFileSync } from "fs"
import gdriveIdLink from "./gdriveIdLink"

class MusicAdapter {
  songUrl!: string
  songName!: string
  songTimeout!: NodeJS.Timeout
  playbackStartTime = 0
  songPosition = () => (Date.now() - this.playbackStartTime) / 1000 // in seconds
}

interface MusicPlayer {
  playSong: () => void
  skipSong: () => void
  getState: () => MusicState
  cleanup: () => void
}

type SongEntry = {
  name: string
  id: string
}

export type MusicState = {
  name: string
  currentTime: number
  url: string
}

export class GoogleDriveMusicPlayer extends MusicAdapter implements MusicPlayer {
  private songs: Array<SongEntry>
  constructor(songlistPath: string, public playSongCallback?: (state: MusicState) => void) {
    super()
    this.songs = JSON.parse(
      readFileSync(songlistPath, { encoding: 'utf-8' })
    )
  }

  playSong(): void {
    const songIndex = Math.round(Math.random() * (this.songs.length - 1))
    // read file and get duration
    this.songUrl = gdriveIdLink(this.songs[songIndex].id)
    this.songName = this.songs[songIndex].name
      // remove extension name
      .substring(0, this.songs[songIndex].name.lastIndexOf('.'))
    // read song from url
    const songDuration = 20 * 1000 // TODO  - THIS NEEDS TO BE UPDATES TO REFLECT THE DURATION OF THE SONG
    // reset playback start time
    this.playbackStartTime = Date.now()
    this.songTimeout = setTimeout(() => this.playSong(), songDuration)
    console.log('[Playing]', this.songName)
    // run callback
    if (this.playSongCallback)
      this.playSongCallback(this.getState())
  }

  skipSong(): void {
    console.log('[Skipping]')
    clearTimeout(this.songTimeout)
    this.playSong()
  }

  getState(): MusicState {
    return {
      name: this.songName,
      url: this.songUrl,
      currentTime: this.songPosition()
    }
  }

  cleanup(): void {
    clearTimeout(this.songTimeout)
  }
}

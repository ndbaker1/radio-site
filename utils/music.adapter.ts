import { readFileSync } from "fs"

class MusicAdapter {
  songId!: string
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

type MusicState = {
  name: string
  id: string
  currentTime: number
}

export class GoogleDriveMusicPlayer extends MusicAdapter implements MusicPlayer {
  private songs: Array<SongEntry>

  constructor(songlistPath: string) {
    super()
    this.songs = JSON.parse(
      readFileSync(songlistPath, { encoding: 'utf-8' })
    )
  }

  playSong(): void {
    const songIndex = Math.round(Math.random() * (this.songs.length - 1))
    // read file and get duration
    this.songId = this.songs[songIndex].id
    this.songName = this.songs[songIndex].name
      // remove extension name
      .substring(0, this.songs[songIndex].name.lastIndexOf('.'))
    // read song from url
    const songDuration = 20 * 1000 // TODO  - THIS NEEDS TO BE UPDATES TO REFLECT THE DURATION OF THE SONG
    // reset playback start time
    this.playbackStartTime = Date.now()
    this.songTimeout = setTimeout(() => this.playSong(), songDuration)
    console.log('[Playing]', this.songName)
  }

  skipSong(): void {
    console.log('[Skipping]')
    clearTimeout(this.songTimeout)
    this.playSong()
  }

  getState(): MusicState {
    return {
      name: this.songName,
      id: this.songId,
      currentTime: this.songPosition()
    }
  }

  cleanup(): void {
    clearTimeout(this.songTimeout)
  }
}

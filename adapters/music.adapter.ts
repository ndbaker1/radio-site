export abstract class MusicAdapter {
  songUrl!: string
  songName!: string
  songTimeout!: NodeJS.Timeout
  playbackStartTime = 0
  songPosition = () => (Date.now() - this.playbackStartTime) / 1000 // in seconds
}

export interface MusicPlayer {
  playSong: () => void
  nextSong: () => void
  getState: () => MusicState
}

export type SongEntry = {
  name: string
  id: string
}

export type MusicState = {
  name: string
  currentTime: number
  url: string
}

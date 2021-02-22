export class MusicPlayer {
  private songIndex!: number
  private playbackStartTime = 0

  constructor(
    private songlist: Array<SongEntry>,
    public playSongCallback?: (state: MusicState) => void
  ) { }

  get currentUrl() { return this.songlist[this.songIndex].url }
  get currentName() { return this.songlist[this.songIndex].name }
  get currentTime() { return (Date.now() - this.playbackStartTime) / 1000 }

  playSong(newSongIndex?: any): void {
    this.songIndex =
      newSongIndex === undefined
        ? Math.round(Math.random() * (this.songlist.length - 1))
        : +newSongIndex

    // useful error to know the requested song index is out of bounds
    if (this.songIndex < 0 || this.songIndex >= this.songlist.length)
      throw new Error('song index is out of range.')

    // reset playback start time
    this.playbackStartTime = Date.now()
    console.log('[Playing]', this.currentName)

    // run callback
    if (this.playSongCallback) this.playSongCallback(this.getState())
  }

  nextSong(): void {
    this.playSong()
  }

  getState(): MusicState {
    return {
      name: this.currentName,
      url: this.currentUrl,
      currentTime: this.currentTime
    }
  }
}

export type SongEntry = {
  name: string
  url: string
}

export type MusicState = {
  currentTime: number
} & SongEntry
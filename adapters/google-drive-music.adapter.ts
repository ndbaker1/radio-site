import { readFileSync } from "fs"
import { MusicAdapter, MusicPlayer, MusicState, SongEntry } from "./music.adapter"

export class GoogleDriveMusicPlayer extends MusicAdapter implements MusicPlayer {
  public songs: Array<SongEntry>
  constructor(songlistPath: string, public playSongCallback?: (state: MusicState) => void) {
    super()
    this.songs = JSON.parse(
      readFileSync(songlistPath, { encoding: 'utf-8' })
    )
  }

  playSong(newSongIndex?: any): void {
    const songIndex = newSongIndex === undefined ? Math.round(Math.random() * (this.songs.length - 1)) : +newSongIndex
    if (songIndex < 0 || songIndex >= this.songs.length)
      throw new Error('song index is out of range.')
    // read file and get duration
    this.songUrl = this.gdriveIdLink(this.songs[songIndex].id)
    this.songName = this.songs[songIndex].name
      // remove extension name
      .substring(0, this.songs[songIndex].name.lastIndexOf('.'))
    // read song from url
    // reset playback start time
    this.playbackStartTime = Date.now()
    console.log('[Playing]', this.songName)
    // run callback
    if (this.playSongCallback)
      this.playSongCallback(this.getState())
  }

  nextSong(): void {
    this.playSong()
  }

  getState(): MusicState {
    return {
      name: this.songName,
      url: this.songUrl,
      currentTime: this.songPosition()
    }
  }

  private gdriveIdLink(gdriveId: string) {
    return "https://docs.google.com/uc?export=download&id=" + gdriveId
  }
}

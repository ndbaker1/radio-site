import { Button, Fade, Slide } from "@material-ui/core"
import { Component, createRef, RefObject } from "react"
import { MusicState } from "../utils/music.adapter"
import styles from './audiostream.module.scss'
import io from 'socket.io-client'

export default class AudioStream extends Component<unknown, SyncingStreamState> {
  private audioPlayer: RefObject<HTMLAudioElement> = createRef()
  private audioPlayerSource: RefObject<HTMLSourceElement> = createRef()
  private socket!: SocketIOClient.Socket
  constructor(props: unknown, private firstload = true) {
    super(props)
    this.state = new SyncingStreamState
    this.setupServerConnection()
    // function bindings
    this.sync = this.sync.bind(this)
    this.skip = this.skip.bind(this)
  }

  setupServerConnection() {
    this.socket = io('http://localhost:8000', { reconnectionDelayMax: 10000 })
    this.socket.on('music-state', (state: MusicState) => {
      this.sync()
    })
  }

  /**
   *  Sync the player after checking with the server data
   */
  sync() {
    fetch('/song')
      .then(data => data.json())
      .then((res: MusicState) => {
        if (this.audioPlayerSource.current && this.audioPlayer.current) {
          // load source and reload URLs
          this.audioPlayerSource.current.src = res.url
          this.audioPlayer.current.load()
          // tell state is loading
          this.setState({ loading: true })
          // play the audio after load finishes
          this.audioPlayer.current.onloadeddata = () => {
            // tell state finished loading and display title
            this.setState({ loading: false })
            this.setState({ currentSongName: res.name })
            // set the player Timestamp and start
            if (this.audioPlayer.current) {
              // set volume low on first load
              if (this.firstload) {
                this.setAudioVolume(0.1)
                this.firstload = false
              }
              // set the timestamp the same as the response and play
              this.audioPlayer.current.currentTime = res.currentTime
              this.audioPlayer.current.play()
            }
          }
        }
      })
  }

  /**
   *  Request skip and resync
   */
  skip() {
    fetch('/skip').then(this.sync)
  }

  /**
   * Sets the volume on the Audio Player
   * @param volume a volume level between 0 and 1
   */
  setAudioVolume(volume: number) {
    if (this.audioPlayer.current)
      this.audioPlayer.current.volume = volume
  }

  render() {
    return (<div className={styles.ui_container}>
      {this.state.focused ? (
        <Slide in={true} timeout={600} direction='up'>
          <div className={styles.ui_container}>
            <div className={styles.ui_container}>
              <Fade in={this.state.loading} timeout={500}>
                <img src='/loading-logo.svg' width="64" height="64" />
              </Fade>
              <Fade in={!this.state.loading} timeout={500}>
                <h4 className={styles.song_title}>{this.state.currentSongName}</h4>
              </Fade>
            </div>
            <div>
              <audio controls ref={this.audioPlayer} onEnded={this.sync}>
                <source ref={this.audioPlayerSource}></source>
                Your browser does not support the audio element.
              </audio>
              <div className={styles.button_container}>
                <Button onClick={this.sync}>Sync</Button>
                <Button onClick={this.skip}>Skip</Button>
              </div>
            </div>
          </div>
        </Slide>
      ) : (
          <Fade in={true} timeout={1500}>
            <Button size='large' onClick={() => {
              this.setState({ focused: true })
              this.sync()
            }}>Start Listening</Button>
          </Fade>
        )
      }
    </div>)
  }
}

class SyncingStreamState {
  currentSongName: string = ''
  focused: boolean = false
  loading: boolean = false
}

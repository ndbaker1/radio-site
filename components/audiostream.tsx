import { Button, Fade, Slide, Snackbar, TextField } from "@material-ui/core"
import { Component, createRef, RefObject } from "react"
import { MusicState } from "../adapters/music.adapter"
import styles from './audiostream.module.scss'
import io from 'socket.io-client'
import socketEvents from "../libs/socket.events"
import ConnectedUserList from "./userlist"
import TrackPlayer from "./trackplayer"

export default class AudioStream extends Component<unknown, SyncingStreamState> {
  private audioPlayer: RefObject<HTMLAudioElement> = createRef()
  private audioPlayerSource: RefObject<HTMLSourceElement> = createRef()
  private streamSocket!: SocketIOClient.Socket
  private firstload = true
  constructor(props: unknown) {
    super(props)
    this.state = new SyncingStreamState
    // function bindings
    this.sync = this.sync.bind(this)
    this.next = this.next.bind(this)
    this.play = this.play.bind(this)
  }

  /**
   * Sets up Socket.io Client
   */
  setupServerConnection() {
    this.streamSocket = io({ reconnectionDelayMax: 10000 })
    this.streamSocket.on(socketEvents.musicState, (state: MusicState) => this.setAudioState(state))
    this.streamSocket.on(socketEvents.connectedUsers, (connectedUsers: Array<string>) => this.setState({ connectedUsers }))
    this.streamSocket.on(socketEvents.songList, (songList: Array<any>) => this.setState({ songList: songList.map(item => item.name) }))

    this.streamSocket.on('connect', () => this.setState({ disconnected: false, userName: this.streamSocket.id }))
    this.streamSocket.on('disconnect', () => this.setState({ disconnected: true }))
  }

  /**
   * Sets the song, timestamp and any other data for the AudioPlayer
   * @param state new state for the AudioPlayer
   */
  setAudioState(state: MusicState) {
    if (this.audioPlayerSource.current && this.audioPlayer.current) {
      // load source and reload URLs
      if (this.audioPlayerSource.current.src === state.url) {
        this.audioPlayer.current.currentTime = state.currentTime
        return
      }
      this.audioPlayerSource.current.src = state.url
      this.audioPlayer.current.load()
      // tell state is loading
      this.setState({ loading: true })
      // play the audio after load finishes
      this.audioPlayer.current.onloadeddata = () => {
        // tell state finished loading and display title
        this.setState({ loading: false })
        this.setState({ currentSongName: state.name })
        // set the player Timestamp and start
        if (this.audioPlayer.current) {
          // set volume low on first load
          if (this.firstload) {
            this.setAudioVolume(0.1)
            this.firstload = false
          }
          // set the timestamp the same as the response and play
          this.audioPlayer.current.currentTime = state.currentTime
          this.audioPlayer.current.play()
        }
      }
    }
  }

  /**
   *  Sync the player after checking with the server data
   */
  sync() {
    fetch('/song')
      .then(data => data.json())
      .then((state: MusicState) => this.setAudioState(state))
  }

  /**
   *  Request skip and resync
   */
  next() {
    fetch('/next')
  }

  /**
   * Plays an index on the songlist
   * @param songIndex index on the Songlist.json object
   */
  play(songIndex: number) {
    fetch('/play?songIndex=' + songIndex)
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
      {
        this.state.focused ? (
          <>
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
                  <audio controls ref={this.audioPlayer} onEnded={this.next}>
                    <source ref={this.audioPlayerSource}></source>
                    Your browser does not support the audio element.
                  </audio>
                  <div className={styles.button_container}>
                    <Button onClick={this.sync}>Sync</Button>
                    <Button onClick={this.next}>Skip</Button>
                  </div>
                  <TextField
                    label="Name"
                    variant="filled"
                    fullWidth={true}
                    value={this.state.userName}
                    onChange={(event) => {
                      const userName = event.target.value
                      this.setState({ userName })
                      this.streamSocket.emit(socketEvents.nameUpdate, userName)
                    }}
                  />
                </div>
              </div>
            </Slide>
            <DisconnectedMessage disconnected={this.state.disconnected} />
            <ConnectedUserList users={this.state.connectedUsers} />
            <TrackPlayer songs={this.state.songList} playTrackIndex={this.play} />
          </>
        ) : (
            <Fade in={true} timeout={1500}>
              <Button size='large' onClick={() => {
                this.setState({ focused: true })
                this.setupServerConnection()
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
  disconnected: boolean = true
  userName: string = ''
  connectedUsers = new Array<string>()
  songList = new Array<any>()
}

const DisconnectedMessage = (props: { disconnected: boolean }): JSX.Element => (
  <Snackbar
    open={props.disconnected}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    message="Disconnected. Trying to Reconnect..."
  />
)


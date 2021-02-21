import { Button, Fade, Slide, Snackbar, TextField } from "@material-ui/core"
import { Component, createRef, RefObject } from "react"

import io from 'socket.io-client'
import streamEvents from "../libs/socket.events"

import { MusicState } from "../adapters/music.adapter"
import ConnectedUserList from "./userlist"
import TrackPlayer from "./trackplayer"

import styles from './audiostream.module.scss'

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
    this.streamSocket.on(streamEvents.musicStateUpdate, (state: MusicState) => this.setAudioState(state))
    this.streamSocket.on(streamEvents.connectedUsersUpdate, (connectedUsers: Array<string>) => this.setState({ connectedUsers }))
    this.streamSocket.on(streamEvents.songListUpdate, (songList: Array<string>) => this.setState({ songList }))

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
  sync = () => fetch('/song').then(data => data.json()).then((state: MusicState) => this.setAudioState(state))

  /**
   *  Request skip
   */
  next = () => fetch('/next')

  /**
   * Plays an index on the songlist
   * @param songIndex index on the Songlist.json object
   */
  play = (songIndex: number) => fetch('/play?songIndex=' + songIndex)

  /**
   * Sets the volume on the Audio Player
   * @param volume a volume level between 0 and 1
   */
  setAudioVolume(volume: number) {
    if (this.audioPlayer.current) this.audioPlayer.current.volume = volume
  }

  render() {
    return (
      <div className={styles.ui_container}>
        {
          this.state.focused
            ? (
              <>
                < this.StreamController />
                < TrackPlayer songs={this.state.songList} playTrackIndex={this.play} />
                < ConnectedUserList users={this.state.connectedUsers} />
                < this.DisconnectedMessage />
              </>
            )
            : (
              < this.LandingPrompt />
            )
        }
      </div>
    )
  }

  private StreamController = (): JSX.Element => (
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
            value={this.state.userName}
            label="Name"
            variant="filled"
            fullWidth={true}
            onChange={(event) => {
              const userName = event.target.value
              this.setState({ userName })
              this.streamSocket.emit(streamEvents.nameUpdate, userName)
            }}
          />
        </div>
      </div>
    </Slide>
  )

  private LandingPrompt = (): JSX.Element => (
    <Fade in={true} timeout={1000}>
      <Button size='large' onClick={() => {
        this.setState({ focused: true })
        this.setupServerConnection()
      }}>Start Listening</Button>
    </Fade>
  )

  private DisconnectedMessage = (): JSX.Element => (
    <Snackbar
      open={this.state.disconnected}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      message="Disconnected. Trying to Reconnect..."
    />
  )
}

class SyncingStreamState {
  // socket.io client state
  disconnected: boolean = true
  // usernames from all connected users
  connectedUsers = new Array<string>()
  // display loading state
  loading: boolean = false
  // switch from landing to app
  focused: boolean = false
  // the name of the currenly playing song
  currentSongName: string = ''
  // this user's display name
  userName: string = ''
  // song names from server
  songList = new Array<string>()
}



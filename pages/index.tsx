import Head from 'next/head'
import { Component, createRef, RefObject } from 'react'
import { Button, Fade, Slide } from '@material-ui/core'

const gdriveSource = (gdriveId: string) => "https://docs.google.com/uc?export=download&id=" + gdriveId

export default function Home() {
  return (
    <div>
      <Head>
        <title>Music Stream</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        < SyncingStream />
      </main>
    </div>
  )
}

class SyncingStream extends Component<unknown, { currentSongName: string, focused: boolean, loading: boolean }> {
  private audioPlayer: RefObject<HTMLAudioElement> = createRef()
  private audioPlayerSource: RefObject<HTMLSourceElement> = createRef()
  constructor(props: unknown) {
    super(props)
    this.state = { currentSongName: '', focused: false, loading: false }
    // function bindings
    this.sync = this.sync.bind(this)
    this.skip = this.skip.bind(this)
  }

  /**
   *  Sync the player after checking with the server data
   */
  sync() {
    fetch('/song')
      .then(data => data.json())
      .then((res: SongServerResponse) => {
        // load source and reload URIs
        if (this.audioPlayerSource.current && this.audioPlayer.current) {
          this.audioPlayerSource.current.src = gdriveSource(res.id)
          this.audioPlayer.current.load()
          this.setState({ loading: true })
          this.audioPlayer.current.onloadeddata = () => {
            this.setState({ loading: false })
            // set the player Timestamp and start
            if (this.audioPlayer.current) {
              this.audioPlayer.current.currentTime = res.currentTime
              this.audioPlayer.current.play()
            }
            // set title
            this.setState({ currentSongName: res.name })
          }
        }
      })
  }

  /**
   *  Request and skip and resync
   */
  skip() {
    fetch('/skip').then(this.sync)
  }

  render() {
    return (<div className="ui-container">
      {this.state.focused ? (
        <Slide in={true} timeout={600} direction='up'>
          <div>
            <div>
              {/* TODO hanlde this loading message and the song name in one spot */}
              <Fade in={this.state.loading} timeout={500}>
                <h4 style={{ color: "white" }}>
                  loading
                </h4>
              </Fade>
              <Fade in={!this.state.loading} timeout={500}>
                <h4 style={{ color: "white" }}>
                  {this.state.currentSongName}
                </h4>
              </Fade>
            </div>
            <audio controls ref={this.audioPlayer} onEnded={this.sync}>
              <source ref={this.audioPlayerSource}></source>
              Your browser does not support the audio element.
            </audio>
            <div className="button-container">
              {/* TODO format the buttons better */}
              <Button onClick={this.sync}>Sync</Button>
              <Button onClick={this.skip}>Skip</Button>
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

type SongServerResponse = {
  id: string
  currentTime: number
  name: string
}
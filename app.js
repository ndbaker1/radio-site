const gdriveSource = (gdriveId) => "https://docs.google.com/uc?export=download&id=" + gdriveId

const titleElement = document.getElementById("song-title")
const audioPlayer = document.getElementById("player")
const audioPlayerSource = document.getElementById("player-source")
const syncButton = document.getElementById("sync-button")
const skipButton = document.getElementById("skip-button")
// default values for audio player
audioPlayer.volume = 0.1

// refresh with the latest track when the song ends
audioPlayer.onended = sync
// manually skip to the latest track
syncButton.onclick = sync
skipButton.onclick = skip

// sync the player after checking with the server
function sync() {
  fetch('/song')
    .then(data => data.json())
    .then(res => {
      // load source and reload URIs
      audioPlayerSource.src = gdriveSource(res.id)
      audioPlayer.load()
      // set the player Timestamp and start
      audioPlayer.currentTime = res.currentTime
      audioPlayer.play()
      // set title
      titleElement.innerHTML = res.name
    })
}

// tell the server to skip the song
function skip() {
  fetch('/skip').then(() => sync())
}
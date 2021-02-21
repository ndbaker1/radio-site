import { Input, List, ListItem, Snackbar } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import { useState } from "react";

const TrackPlayer = (props: { songs: Array<string>, playTrackIndex: (index: number) => void }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <>
      <Snackbar
        open={!open}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        message="Open Tracklist"
      />
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        message={
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 76px)', width: 500, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Track List</h2>
              <CloseIcon onClick={() => setOpen(false)} style={{ cursor: 'pointer' }} />
            </div>
            <Input fullWidth={true} placeholder="Search" value={searchTerm} onChange={(event: any) => setSearchTerm(event.target.value)} />
            <div style={{ overflow: 'auto', overflowWrap: 'break-word' }}>
              <List>
                {
                  props.songs
                    .map((song, index) => <ListItem key={song} onClick={() => props.playTrackIndex(index)} button>{song}</ListItem>)
                    .filter(item => item.key?.toString().toLowerCase().includes(searchTerm))
                }
              </List>
            </div>
          </div>
        }
      />
    </>
  )
}

export default TrackPlayer
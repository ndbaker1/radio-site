import { Snackbar } from "@material-ui/core"
import CloseIcon from '@material-ui/icons/Close';
import { useState } from "react"
import styleVariables from '../styles/variables.module.scss'

export default function ConnectedUserList(props: { users: Array<string> }): JSX.Element {
  const [open, setOpen] = useState(true)

  return (
    <>
      <Snackbar
        open={!open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        message="See Listeners"
      />
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message={
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: styleVariables.material_snackbar_maxHeight, width: 300, overflow: 'hidden' }} >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Listeners</h2>
              <CloseIcon onClick={() => setOpen(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ overflow: 'auto', overflowWrap: 'break-word' }}>
              {props.users.map(user => <p>{user}</p>)}
            </div>
          </div>
        }
      />
    </>
  )
}
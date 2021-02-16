import '../styles/globals.scss'
import { AppProps } from 'next/app'
import { createMuiTheme, ThemeProvider } from '@material-ui/core'
import styles from '../styles/theme.module.scss'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: styles.textColor
    },
    secondary: {
      main: styles.textColor
    },
    text: {
      primary: styles.textColor,
      secondary: styles.textColor
    }
  }
})

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider >
  )
}

export default MyApp

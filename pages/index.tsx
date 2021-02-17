import Head from 'next/head'
import AudioStream from '../components/audiostream'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Music Stream</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        < AudioStream />
        < CreatorLink text="Nicholas Baker 2021" link="https://github.com/ndbaker1/radio-site" />
      </main>
    </div>
  )
}

function CreatorLink(props: { text: string, link: string }): JSX.Element {
  return <a href={props.link} style={{
    color: 'white',
    position: "absolute",
    right: 0,
    bottom: 0,
    margin: '6px',
    fontSize: '0.8rem',
    textDecoration: 'none'
  }}>{props.text}</a>
}
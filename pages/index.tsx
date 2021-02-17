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
      </main>
    </div>
  )
}

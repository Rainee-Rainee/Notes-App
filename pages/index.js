import Head from 'next/head'
import styles from '@/styles/home.module.css'
import LogoutButton from '@/components/LogoutButton'
import Note from '@/components/Note'

export default function Home() {
  return (
    <div className={styles.home}>
      <Head>
        <title>NoTeS</title>
      </Head>
      <main className={styles.main}>
        <Note />
        <LogoutButton />
        
      </main>
    </div>
  )
}

import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <span className="pr-4 pl-4 pt-2 pb-2 bg-slate-300 shadow-md">Pay now</span>
    </div>
  )
}
